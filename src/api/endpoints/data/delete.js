const fs = require('fs');
const authViaApiKey = require('../../tools/authViaApiKey');
const resolveChilds = require('../../tools/resolveChilds');
const nodeModel = require('../../../models/node');

module.exports = async req => {
    const {nodes, apikey} = req.body;

    // Authenticate and resolve child nodes
    const user = await authViaApiKey(apikey);
    const childs = await resolveChilds(user, nodes);

    // Delete files
    for (let i = 0; i < childs.length; i++) {
        const node = childs[i];

        // Prevent deleting to root element
        if (node.parent === 'root') {
            throw 'Can\'t delete root node';
        }

        // Remove file if node is an file
        if (node.type === 'file') {

            // Build local storage path and check if file exists
            const path = `${_storagePath}/${node.id}`;
            if (fs.existsSync(path)) {
                fs.unlink(path, () => 0);
            }
        }
    }

    // Remove nodes
    const ids = childs.map(v => v.id);
    return nodeModel.deleteMany({owner: user.id, id: {$in: ids}})
        .exec()
        .then(() => null);
};
