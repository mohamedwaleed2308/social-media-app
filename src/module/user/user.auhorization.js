import { roleTypes } from "../../DB/model/User.model.js";


export const endPoint = {
    accessRoles: [roleTypes.user, roleTypes.admin],
    changeRoles: [roleTypes.superAdmin, roleTypes.admin],
    addFriend: [roleTypes.user]
}