import { roleTypes } from "../../DB/model/User.model.js";

export const endPoint = {
    createPost: [roleTypes.user, roleTypes.admin, roleTypes.superAdmin],
    freezePost: [roleTypes.admin, roleTypes.user],
    likePost: [roleTypes.admin, roleTypes.user],
    getPublicPosts: [roleTypes.user]
}