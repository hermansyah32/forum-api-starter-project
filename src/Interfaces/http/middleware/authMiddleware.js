import AuthenticationError from "../../../Commons/exceptions/AuthenticationError.js";
import AuthenticationTokenManager from "../../../Applications/security/AuthenticationTokenManager.js";

const authMiddleware = (cotnainer) => async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError('Authorization header is required');
        }

        const token = authHeader.replace('Bearer ', '');
        await cotnainer.getInstance(AuthenticationTokenManager.name)
            .verifyAccessToken(token);
        const decodedPayload = await cotnainer.getInstance(AuthenticationTokenManager.name)
            .decodePayload(token);
        req.auth = decodedPayload;

        next();
    } catch (error) {
        next(error);
    }
}


export default authMiddleware;