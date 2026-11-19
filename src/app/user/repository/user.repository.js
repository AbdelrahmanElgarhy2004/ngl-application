import {User} from "../model/user.model.js";

export async function checkUserExistByEmail(email) {
    return User.findOne({email: email});
}

export async function findUserById(id) {
    return User.findOne({_id: id, isDeleted: false}, {}, {});
}

export async function updateUser(email, updatedData) {
    return User.findOneAndUpdate({email: email}, updatedData, {returnDocument: "after"});
}