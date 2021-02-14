import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import firebase from 'firebase';
import * as admin from 'firebase-admin';


import { CreateUserDto } from './dto/user.dto';
import { iToken } from './interfaces/auth.interface';


@Controller('')
export class AuthController {
    /**
     * using this method user can be registered in the system provided name and get authorisation token. 
     * @param res Response
     * @param body CreateUserDto
     */
    @Post("/register")
    async register(@Res() res: Response, @Body() body: CreateUserDto) {
        admin
            .auth().createUser
            ({
                uid: body.name
            })
            .then(async (user) => {
                await admin.auth().createCustomToken(user.uid)
                    .then(async (customToken) => {
                        res.status(HttpStatus.CREATED).json({
                            token: `Bearer ${customToken}`
                        });
                        const db = admin.database();
                        const ref = db.ref(`/users/${user.uid}`);
                        ref.set({
                            points: 0
                        });
                    })
                    .catch((error) => {
                        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error)
                    });
            })
            .catch((error) => {
                res.status(HttpStatus.NOT_ACCEPTABLE).json(error)
            });
    }

    /**
     * user can get information about himself
     * @param res Response
     * @param req Request
     */
    @Get("/me")
    async me(@Res() res: Response, @Req() req: Request) {
        let token = req.headers.authorization;
        if (!token) {
            res.status(HttpStatus.BAD_REQUEST).json({
                datail: "No token found in headers"
            })
        }
        token = token.replace('Bearer', '').trim();
        await firebase.auth().signInWithCustomToken(token)
            .then(async (decodedToken) => {
                const uid = decodedToken.user.uid;
                const db = admin.database();
                const ref = db.ref(`/users/${uid}`);
                let userInfo = await new Promise((resolve, reject) => {
                    ref.on('value', (info) => {
                        const points = info.val()["points"];
                        resolve({
                            username: uid,
                            points
                        });
                    });
                });
                res.status(HttpStatus.OK).json(userInfo)
            })
            .catch((error) => {
                // Handle error
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error)
            });
    }

    
}
