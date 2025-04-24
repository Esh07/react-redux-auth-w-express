import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express';
import { Payload as PayLoad } from './api/users/users.routes';
import cookie from 'cookie';

interface Payload extends JwtPayload {
    userId: string;
@@ -9, 6 + 10, 7 @@interface Payload extends JwtPayload {

    interface CustomRequest extends Request {
        payload?: Payload;
        isAuthenticated?: boolean;
    }

    function notFound(req: Request, res: Response, next: NextFunction) {
        @@ -27, 41 + 29, 68 @@function errorHandler(err: Error, req: Request, res: Response, next: NextFunctio
    });
}

function isAuthenticated(req: CustomRequest, res: Response, next: NextFunction): boolean {

    // const { authorization } = req.headers;

    const token = cookie.parse(req.headers.cookie || '').token;
    console.log(token);

    if (!token) {
        console.log('Token not found in cookie');
        req.isAuthenticated = false;
        // next();
        return false;
    }

    // if (!authorization) {
    //     console.log(token);
    //     res.status(401).json({ message: '🚫 Un-Authorized 🚫' });
    //     return false;
    // }

    const secret = process.env.JWT_ACCESS_SECRET as string;
    if (!secret) {
        res.status(500).json({ message: 'Internal Server Error' });
        return false;
    }

    try {
        const decoded = jwt.verify(token, secret) as JwtPayload;
        const payload = decoded as Payload;
        req.payload = payload as Payload;
        req.isAuthenticated = true;
        next();// Pass control to the next middleware or route handler



    } catch (err) {
        req.isAuthenticated = false;
        res.status(401).json({ message: '🚫 Un-Authorized 🚫' });

        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: 'Token has  been expired' });
        }
        else {
            res.json({ message: '🚫 Un-Authorized 🚫' });
        }

        return false;
    }

    return true;
}

function checkAlreadyAuthenticated(req: CustomRequest, res: Response, next: NextFunction) {
    if (req.isAuthenticated) {
        res.status(409).json({ message: 'Already authenticated' });
        return;
    }
    next();
}
export {
    notFound,
    errorHandler,
    isAuthenticated,
    checkAlreadyAuthenticated
};