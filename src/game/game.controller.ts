import { Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { rejects } from 'assert';
import { Response, Request } from "express";
import firebase from 'firebase';
import * as admin from 'firebase-admin';
const moment = require('moment');

@Controller('game')
export class GameController {

    /**
     * Using this method user is able to add random number of points (from 1 to 100, generated on server) to his balance.
     * @param res Response
     * @param req Reqeust
     */
    @Post('/play')
    async play(@Res() res: Response, @Req() req: Request) {
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
                    ref.once('value', (info) => {
                        resolve(info.val());
                    });
                });
                if (!userInfo["played"]) {
                    userInfo["played"] = 1;
                    const addedPoints = Math.floor(Math.random() * 100) + 1;
                    userInfo["points"] += addedPoints;
                    userInfo["lastPlayedDate"] = new Date(Date.now()).toISOString();
                    await ref.update(userInfo);
                    res.status(HttpStatus.OK).json({
                        points_added: addedPoints,
                        points_total: userInfo["points"]
                    });
                }
                if (userInfo["played"] < 5) {
                    const addedPoints = Math.floor(Math.random() * 100) + 1;
                    userInfo["points"] += addedPoints;
                    userInfo["played"] += 1;
                    userInfo["lastPlayedDate"] = new Date(Date.now()).toISOString();
                    await ref.update(userInfo);
                    res.status(HttpStatus.OK).json({
                        points_added: addedPoints,
                        points_total: userInfo["points"]
                    });
                } else {
                    const lastPlayedDate = moment(userInfo["lastPlayedDate"]);
                    let nextPlayDate = moment(lastPlayedDate).add(1, 'hour');
                    const now = moment(new Date(Date.now()).toISOString());
                    if (now.isAfter(nextPlayDate)) {
                        userInfo["played"] = 1;
                        const addedPoints = Math.floor(Math.random() * 100) + 1;
                        userInfo["points"] += addedPoints;
                        userInfo["lastPlayedDate"] = new Date(Date.now()).toISOString();
                        await ref.update(userInfo);
                        res.status(HttpStatus.OK).json({
                            points_added: addedPoints,
                            points_total: userInfo["points"]
                        });
                    }

                    res.status(HttpStatus.NOT_ACCEPTABLE).json({
                        message: `You can play only after ${nextPlayDate.format('hh:mm:SS A')}`,
                    });
                }
            })
            .catch((error) => {
                // Handle error
                console.log(error);
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error)
            });
    }

    /**
     * 
     * @param res Response
     * @param req Request
     */
    @Post('/claim_bonus')
    async claimBonus(@Res() res: Response, @Req() req: Request) {
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
                    ref.once('value', (info) => {
                        resolve(info.val());
                    });
                });
                const registrationDate = moment(userInfo['registrationDate']);
                const now = new Date(Date.now()).toISOString()
                let bonuses = this.getBonuses(registrationDate, moment(now));
                const lastClaimed = userInfo['lastClaimed'];
                if(!lastClaimed) {
                    userInfo['lastClaimed'] = new Date(Date.now()).toISOString();
                    userInfo["points"] += bonuses;
                } else {
                    bonuses = this.getBonuses(moment(lastClaimed), moment(now));
                    if(bonuses > 0) {   
                        userInfo['lastClaimed'] = new Date(Date.now()).toISOString();
                    }
                    userInfo["points"] += bonuses;
                }
                ref.update(userInfo);
                res.status(HttpStatus.OK).json({
                    points_added: bonuses,
                    points_total: userInfo["points"]
                });
            })
            .catch((error) => {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error)
            });
    }


    /**
     * 
     * @param startDate 
     * @param endDate 
     */
    getBonuses(startDate, endDate) {
        const minutes = endDate.diff(startDate, 'minutes', false); 
        if(minutes > 10) return 100;
        return minutes * 10;
    }
}
