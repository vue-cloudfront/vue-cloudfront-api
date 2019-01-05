const {uid} = require('../../../utils');
const bcrypt = require('bcrypt');
const config = require('../../../../config/config');
const userModel = require('../../../models/user');

module.exports = async req => {
    const {username, password} = req.body;

    // Check to see if the user already exists and throw error if so
    return userModel.findOne({username}).exec().then(async opuser => {

        // Validate
        if (!opuser) {
            throw 'User not found';
        }

        if (!bcrypt.compareSync(password, opuser.password)) {
            throw 'Wrong password';
        }

        // Create and append new apikey
        const apikey = uid();
        opuser.apikeys.push({
            key: apikey,
            expiry: Date.now() + config.auth.apikeyExpiry
        });

        // Save user with new apikey
        await opuser.save();
        return {apikey};
    });
};
