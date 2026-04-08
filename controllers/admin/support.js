import Support from '../../models/Support.js';

const getSupportOverview = async (req, res) => {
    try {
        // Count support tickets by status
        const [openCount, pendingCount, closedCount] = await Promise.all([
            Support.countDocuments({ status: 'OPEN' }),
            Support.countDocuments({ status: 'PENDING' }),
            Support.countDocuments({ status: 'CLOSED' })
        ]);

        res.status(200).json({
            status: "SUCCESS",
            data: {
                OPEN: openCount,
                PENDING: pendingCount,
                CLOSED: closedCount
            }
        });
    } catch (error) {
        res.status(500).json({
            status: "FAILED",
            message: error.message
        });
    }
};

const getAllSupportTickets = async (req, res) => {
    try {
        const { id } = req.params;
        if (id) {
            const ticket = await Support.findById(id);
            if (!ticket) {
                return res.status(404).json({ status: "FAILED", message: "Support ticket not found." });
            }
            return res.status(200).json({ status: "SUCCESS", data: ticket });
        } else {
            const supportTickets = await Support.find();
            return res.status(200).json({ status: "SUCCESS", data: supportTickets });
        }
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};


const updateSupportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!id) {
            return res.status(400).json({ status: "FAILED", message: "Support ticket id is required." });
        }

        if (!["OPEN", "PENDING", "CLOSED"].includes(status)) {
            return res.status(400).json({ status: "FAILED", message: "Invalid status value." });
        }

        const updatedTicket = await Support.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedTicket) {
            return res.status(404).json({ status: "FAILED", message: "Support ticket not found." });
        }

        return res.status(200).json({ status: "SUCCESS", data: updatedTicket });
    } catch (error) {
        res.status(500).json({ status: "FAILED", message: error.message });
    }
};


export { getSupportOverview, getAllSupportTickets, updateSupportStatus };