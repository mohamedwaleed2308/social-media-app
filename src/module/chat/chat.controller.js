

import { authentication } from '../../middleWare/auth.middleware.js';
import * as chatService from './services/chat.service.js'
import { Router } from "express";
const router=Router()


router.get('/:friendId',authentication(),chatService.getChat)

export default router;