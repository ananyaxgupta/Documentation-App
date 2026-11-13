import express from 'express';
import auth from '../middleware/auth.js';
import Document from '../schema/documentSchema.js';

const router = express.Router();

// @route   GET /api/docs
// @desc    Get all documents for user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const docs = await Document.find({ owner: req.user.id }).sort({ updatedAt: -1 });
        res.json(docs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/docs/:id
// @desc    Get single document details
// @access  Public / Authenticated
router.get('/:id', async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Document not found' });
        res.json(doc);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/docs
// @desc    Create a new document
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { id, title } = req.body;

        const newDoc = new Document({
            _id: id,
            title: title || 'Untitled Document',
            data: {},
            owner: req.user.id,
            versions: [{
                versionNumber: 1,
                label: 'v1 – Initial draft',
                data: {},
                author: 'You',
                createdAt: new Date()
            }]
        });

        const doc = await newDoc.save();
        res.json(doc);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/docs/:id
// @desc    Delete a document
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        let doc = await Document.findById(req.params.id);

        if (!doc) return res.status(404).json({ msg: 'Document not found' });

        // Make sure user owns document
        if (doc.owner && doc.owner.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await Document.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Document removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH /api/docs/:id
// @desc    Update document title
// @access  Public / Authenticated
router.patch('/:id', async (req, res) => {
    try {
        const { title } = req.body;
        let doc = await Document.findById(req.params.id);

        if (!doc) return res.status(404).json({ msg: 'Document not found' });

        doc.title = title || 'Untitled Document';
        await doc.save();
        res.json(doc);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/docs/:id/versions
// @desc    Get all version snapshots
// @access  Public / Authenticated
router.get('/:id/versions', async (req, res) => {
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.json([]);

        res.json(doc.versions || []);
    } catch (err) {
        console.error('Error fetching versions:', err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
});

// @route   POST /api/docs/:id/versions
// @desc    Create a new version snapshot
// @access  Public / Authenticated
router.post('/:id/versions', async (req, res) => {
    try {
        const { data, label, author } = req.body;
        let doc = await Document.findById(req.params.id);

        if (!doc) {
            doc = new Document({
                _id: req.params.id,
                title: 'Untitled Document',
                data: data || {},
                versions: []
            });
        }

        const versionData = (data !== undefined && data !== null) ? data : (doc.data || {});
        const nextNum = (doc.versions && doc.versions.length ? Math.max(...doc.versions.map(v => v.versionNumber || 0)) : 0) + 1;

        const newVersion = {
            versionNumber: nextNum,
            label: label || `v${nextNum} – Snapshot`,
            data: versionData,
            author: author || 'You',
            createdAt: new Date()
        };

        if (!doc.versions) doc.versions = [];
        doc.versions.unshift(newVersion);
        await doc.save();

        res.json(doc.versions);
    } catch (err) {
        console.error('Error saving version:', err);
        res.status(500).json({ msg: 'Server Error saving version', error: err.message });
    }
});

// @route   POST /api/docs/:id/restore/:versionId
// @desc    Restore a version snapshot
// @access  Public / Authenticated
router.post('/:id/restore/:versionId', async (req, res) => {
    try {
        let doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ msg: 'Document not found' });

        const targetVersion = (doc.versions && doc.versions.id ? doc.versions.id(req.params.versionId) : null) ||
            doc.versions.find(v => v._id?.toString() === req.params.versionId || v.versionNumber === Number(req.params.versionId));

        if (!targetVersion) return res.status(404).json({ msg: 'Version not found' });

        doc.data = targetVersion.data;
        await doc.save();

        res.json({ msg: 'Version restored', doc, restoredVersion: targetVersion });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
