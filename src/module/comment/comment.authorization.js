import { roleTypes } from "../../DB/model/User.model.js";

export const commentEndPoint = {
    createPost: [roleTypes.user],
    updatePost: [roleTypes.user],
    freezeComent: [roleTypes.user, roleTypes.admin],
    likeComment: [roleTypes.user]
}