
import Document from '../schema/documentSchema.js';

export const getDocument = async (id) => {
    if (!id) return null;

    const document = await Document.findById(id);
    if (document) return document;

    return await Document.create({
        _id: id,
        title: 'Untitled Document',
        data: {},
        versions: [{
            versionNumber: 1,
            label: 'v1 – Initial draft',
            data: {},
            author: 'You',
            createdAt: new Date()
        }]
    });
};

export const updateDocument = async (id, data) => {
    return await Document.findByIdAndUpdate(id, { data });
};
