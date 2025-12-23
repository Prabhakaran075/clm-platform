const { prisma } = require('../config/db');

// @desc    Create a new contract
// @route   POST /api/contracts
// @access  Private (StoreOwner, DeptManager, Admin)
const createContract = async (req, res) => {
    try {
        console.log('--- CREATE CONTRACT START ---');
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
        console.log('Authenticated User:', JSON.stringify(req.user, null, 2));

        const { title, vendor, startDate, endDate, amount, currency, content, department } = req.body;

        // Prisma relational fields use actual IDs
        // Note: frontend sends 'vendor' as the ID
        const vendorId = vendor;

        // Check if vendor exists
        const vendorExists = await prisma.vendor.findUnique({
            where: { id: vendorId }
        });

        if (!vendorExists) {
            console.error('Vendor not found:', vendorId);
            return res.status(400).json({ message: 'The selected vendor does not exist. Please create the vendor first.' });
        }

        const contractValue = req.body.value || {
            amount: amount || 0,
            currency: currency || 'INR'
        };

        console.log('Normalized Contract Value:', contractValue);

        // Process attachments
        const attachments = req.files ? req.files.map(file => ({
            name: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size
        })) : [];

        const contract = await prisma.contract.create({
            data: {
                title,
                vendorId,
                ownerId: req.user.id,
                startDate: new Date(startDate || Date.now()),
                endDate: new Date(endDate || Date.now()),
                value: contractValue,
                content: content || '',
                department: department || 'General',
                attachments: attachments
            }
        });

        console.log('Contract Created Successfully:', contract.id);

        // Create Audit Log
        await prisma.auditLog.create({
            data: {
                action: 'Create',
                contractId: contract.id,
                userId: req.user.id,
                userName: req.user.name,
                details: 'Initial contract creation',
                ipAddress: req.ip
            }
        });

        res.status(201).json({ ...contract, _id: contract.id });
    } catch (error) {
        console.error('Error in createContract:', error);
        res.status(500).json({
            message: 'Failed to create contract',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Get all contracts
// @route   GET /api/contracts
// @access  Private
const getContracts = async (req, res) => {
    try {
        let where = { isLatest: true };

        // Default filter for all non-Vendor users (Manager, Admin, etc.)
        where.ownerId = req.user.id;

        // If user is a Vendor, restrict to their contracts (this overrides ownerId filter for vendors)
        if (req.user.role === 'Vendor') {
            delete where.ownerId; // Vendors don't "own" contracts usually, they are linked via vendorId
            if (!req.user.vendorId) {
                return res.status(403).json({ message: 'Vendor profile not linked to user account' });
            }
            where.vendorId = req.user.vendorId;
        }

        const contracts = await prisma.contract.findMany({
            where,
            include: {
                vendor: { select: { name: true, email: true } },
                owner: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Add _id for frontend compatibility
        const contractsWithId = contracts.map(c => ({ ...c, _id: c.id }));
        res.json(contractsWithId);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get contract by ID
// @route   GET /api/contracts/:id
// @access  Private
const getContractById = async (req, res) => {
    try {
        const contract = await prisma.contract.findFirst({
            where: {
                id: req.params.id,
                OR: [
                    { ownerId: req.user.id },
                    { vendorId: req.user.vendorId || 'none' }
                ]
            },
            include: {
                vendor: true,
                owner: { select: { name: true, email: true } },
                auditLogs: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (contract) {
            // Reformat for frontend expectations
            const contractObj = {
                ...contract,
                _id: contract.id,
                auditLog: (contract.auditLogs || []).map(log => ({
                    action: log.action,
                    user: log.userName || 'System',
                    date: log.createdAt,
                    details: log.details
                }))
            };
            res.json(contractObj);
        } else {
            res.status(404).json({ message: 'Contract not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update contract (Create New Version)
// @route   PUT /api/contracts/:id
// @access  Private
const updateContract = async (req, res) => {
    try {
        const oldContract = await prisma.contract.findUnique({
            where: { id: req.params.id }
        });

        if (oldContract) {
            // Permissions check
            if (req.user.role === 'Vendor') {
                return res.status(403).json({ message: 'Vendors cannot edit contracts' });
            }

            // 1. Mark old contract as not latest
            await prisma.contract.update({
                where: { id: req.params.id },
                data: { isLatest: false }
            });

            // 2. Create new version
            const newContract = await prisma.contract.create({
                data: {
                    title: req.body.title || oldContract.title,
                    vendorId: oldContract.vendorId, // Cannot change vendor
                    ownerId: req.user.id,
                    startDate: req.body.startDate ? new Date(req.body.startDate) : oldContract.startDate,
                    endDate: req.body.endDate ? new Date(req.body.endDate) : oldContract.endDate,
                    value: req.body.value || oldContract.value,
                    content: req.body.content || oldContract.content,
                    status: req.body.status || 'Draft',
                    department: req.body.department || oldContract.department,

                    // Versioning fields
                    version: oldContract.version + 1,
                    rootContractId: oldContract.rootContractId || oldContract.id,
                    isLatest: true
                }
            });

            // 3. Create Audit Log
            await prisma.auditLog.create({
                data: {
                    action: 'Edit',
                    contractId: newContract.id,
                    userId: req.user.id,
                    userName: req.user.name,
                    details: `Created version ${newContract.version} from version ${oldContract.version}`,
                    ipAddress: req.ip
                }
            });

            res.json({ ...newContract, _id: newContract.id });
        } else {
            res.status(404).json({ message: 'Contract not found' });
        }
    } catch (error) {
        console.error('Error in updateContract:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

// @desc    Delete contract
// @route   DELETE /api/contracts/:id
// @access  Private (Admin, StoreOwner, DeptManager)
const deleteContract = async (req, res) => {
    try {
        const contract = await prisma.contract.findUnique({
            where: { id: req.params.id }
        });

        if (!contract) {
            return res.status(404).json({ message: 'Contract not found' });
        }

        // Permissions check
        if (req.user.role === 'Vendor') {
            return res.status(403).json({ message: 'Vendors cannot delete contracts' });
        }

        // Delete associated audit logs first
        await prisma.auditLog.deleteMany({
            where: { contractId: req.params.id }
        });

        // Delete the contract
        await prisma.contract.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Contract deleted successfully' });
    } catch (error) {
        console.error('Error in deleteContract:', error);
        res.status(500).json({ message: error.message || 'Server Error' });
    }
};

module.exports = {
    createContract,
    getContracts,
    getContractById,
    updateContract,
    deleteContract,
};
