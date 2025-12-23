const { prisma } = require('../config/db');

// @desc    Create a new vendor
// @route   POST /api/vendors
// @access  Private (Admin, StoreOwner)
const createVendor = async (req, res) => {
    const { name, email, phone, type, address } = req.body;

    try {
        const createdVendor = await prisma.vendor.create({
            data: {
                name,
                email,
                phone,
                type,
                address, // Prisma handles JSON fields automatically
                ownerId: req.user.id
            }
        });
        res.status(201).json({ ...createdVendor, _id: createdVendor.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Private
const getVendors = async (req, res) => {
    try {
        const vendors = await prisma.vendor.findMany({
            where: { ownerId: req.user.id }
        });
        // Return with _id for frontend compatibility
        const vendorsWithId = vendors.map(v => ({ ...v, _id: v.id }));
        res.json(vendorsWithId);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get vendor by ID
// @route   GET /api/vendors/:id
// @access  Private
const getVendorById = async (req, res) => {
    try {
        const vendor = await prisma.vendor.findFirst({
            where: {
                id: req.params.id,
                ownerId: req.user.id
            },
            include: {
                contracts: {
                    orderBy: { createdAt: 'desc' },
                    where: { isLatest: true } // Bonus: show only latest contracts
                }
            }
        });

        if (vendor) {
            res.json({ ...vendor, _id: vendor.id });
        } else {
            res.status(404).json({ message: 'Vendor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update vendor
// @route   PUT /api/vendors/:id
// @access  Private (Admin, StoreOwner)
const updateVendor = async (req, res) => {
    const { name, email, phone, type, status, address } = req.body;

    try {
        const vendor = await prisma.vendor.findFirst({
            where: {
                id: req.params.id,
                ownerId: req.user.id
            }
        });

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const updatedVendor = await prisma.vendor.update({
            where: { id: req.params.id },
            data: {
                name: name || undefined,
                email: email || undefined,
                phone: phone || undefined,
                type: type || undefined,
                status: status || undefined,
                address: address || undefined
            }
        });

        res.json({ ...updatedVendor, _id: updatedVendor.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete vendor
// @route   DELETE /api/vendors/:id
// @access  Private (Admin, StoreOwner)
const deleteVendor = async (req, res) => {
    try {
        const vendor = await prisma.vendor.findFirst({
            where: {
                id: req.params.id,
                ownerId: req.user.id
            },
            include: {
                _count: {
                    select: { contracts: true, users: true }
                }
            }
        });

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        // Check if vendor has active contracts or users
        if (vendor._count.contracts > 0) {
            return res.status(400).json({
                message: 'Cannot delete vendor with associated contracts. Please delete or reassign contracts first.'
            });
        }

        if (vendor._count.users > 0) {
            return res.status(400).json({
                message: 'Cannot delete vendor with associated users. Please delete or reassign users first.'
            });
        }

        await prisma.vendor.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createVendor,
    getVendors,
    getVendorById,
    updateVendor,
    deleteVendor
};
