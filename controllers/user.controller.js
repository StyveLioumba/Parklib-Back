const User = require("../models").User;
const Role = require("../models").Role;
const bcrypt = require('bcrypt');
const constante = require('../utils/constantes.util.js');
const logger = require('../utils/logger.util.js');
const HttpStatus = require('../utils/httpStatus.util.js');
const Response = require('../utils/response.util.js');
const UUID = require('uuid');

exports.findAllUser = (req, res) => {
    const isActivated = req.query.isActivated??true;
    logger.info(`${req.method} ${req.originalUrl}, Fetching users.`);
    User.findAll(
        {
            paranoid: false,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Role,
                    attributes: ['id', 'title'],
                    through: {
                        attributes: []
                    }
                }
            ]
        })
        .then(data => {
            const users = data.map(user => {
                const {password, ...userWithoutPassword} = user.dataValues;
                return userWithoutPassword;
            })
            res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code,HttpStatus.OK.message,`Accounts retrieved`, users));
        })
        .catch(err => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code,HttpStatus.INTERNAL_SERVER_ERROR.message,`Some error occurred while retrieving the accounts.`));
        });
};

exports.findOneUser = (req, res) => {
    logger.info(`${req.method} ${req.originalUrl}, Fetching user.`);
    const id = req.params.id;
    if (id==null) {
        res.status(HttpStatus.NO_CONTENT.code)
            .send(new Response(HttpStatus.NO_CONTENT.code,HttpStatus.NO_CONTENT.message,`Content can not be empty!` ));
        return;
    }

    User.findByPk(id,
        {
            include: [
                {
                    model: Role,
                    attributes: ['id', 'title'],
                    through: {
                        attributes: []
                    }
                }
            ]
        })
        .then(data => {
            const {password, ...user} = data.dataValues;
            if (!user.isActivated) {
                res.status(HttpStatus.OK.code)
                    .send(new Response(HttpStatus.OK.code,HttpStatus.OK.message,`Account was deleted!`));
                return;
            }
            res.status(HttpStatus.OK.code)
                .send(new Response(HttpStatus.OK.code,HttpStatus.OK.message,`Account retrieved`, user));

        })
        .catch(err => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code,HttpStatus.INTERNAL_SERVER_ERROR.message,`Error retrieving account with id = ${id} `));
        });
}

exports.updateUser = async (req, res) => {

    const id = req.params.id;
    const firstName = req.body.firstName??null;
    const lastName = req.body.lastName??null;
    const phone = req.body.phone??null;
    const address = req.body.address??null;

    let user = {};

    if(firstName) user.firstName = firstName;
    if(lastName) user.lastName = lastName;
    if(phone) user.phone = phone;
    if(address) user.address = address;

    if (id==null || Object.keys(user).length===0) {
        res.status(HttpStatus.NO_CONTENT.code)
            .send(new Response(HttpStatus.NO_CONTENT.code,HttpStatus.NO_CONTENT.message,`Content can not be empty!` ));
        return;
    }

    const userIdConnected = req.user.id;

    const userId = await User.findOne({
        where: {
            id : id
        }
    })

    if(userIdConnected != userId.id ){
        res.status(HttpStatus.FORBIDDEN.code).send(
            new Response(
                HttpStatus.FORBIDDEN.code,
                HttpStatus.FORBIDDEN.message,
                'You\'re not the owner of those account'
            )
        )
    }

    logger.info(`${req.method} ${req.originalUrl}, Updating user.`);

    User.update(user, 
        {
            where: {id: id},
            include: [
                {
                    model: Role,
                    attributes: ['id', 'title'],
                    through: {
                        attributes: []
                    }
                }
            ]
        })
        .then(response => {
            if (response[0] === 0) {
                res.status(HttpStatus.OK.code)
                    .send(new Response(HttpStatus.OK.code,HttpStatus.OK.message,`Cannot update account with id=${id}. Maybe User was not found!`));
                return;
            }
            User.findByPk(id).then(data=>{
                const {password, ...user} = data.dataValues;
                res.status(HttpStatus.OK.code)
                    .send(new Response(HttpStatus.OK.code,HttpStatus.OK.message,`Account updated`, user));
            })
        })
        .catch(error => {
            if (error.name === 'SequelizeUniqueConstraintError') {
                res.status(HttpStatus.FORBIDDEN.code)
                    .send(new Response(HttpStatus.FORBIDDEN.code,HttpStatus.FORBIDDEN.message,`Phone number is already used in an other account` ));
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                    .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code,HttpStatus.INTERNAL_SERVER_ERROR.message,`Error updating account with id = ${id}.`));
            }
        });
}

exports.updateProfilePicture = async (req, res) => {
    const id = req.params.id;

    const firstName = req.body.firstName??null;
    const lastName = req.body.lastName??null;
    const picture = req.file??null;
    const phone = req.body.phone??null;
    const address = req.body.address??null;

    let user = {};

    if(firstName) user.firstName = firstName;
    if(lastName) user.lastName = lastName;
    if(picture) user.picture = picture.filename;
    if(phone) user.phone = phone;
    if(address) user.address = address;

    if ((!id && !picture) || Object.keys(user).length===0) {
        res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code,HttpStatus.BAD_REQUEST.message,`Content can not be empty!` ));
        return;
    }

    const userIdConnected = req.user.id;

    const userId = await User.findOne({
        where: {
            id : id
        }
    })

    if(userIdConnected != userId.id ){
        res.status(HttpStatus.FORBIDDEN.code).send(
            new Response(
                HttpStatus.FORBIDDEN.code,
                HttpStatus.FORBIDDEN.message,
                'You\'re not the owner of those account'
            )
        )
    }

    logger.info(`${req.method} ${req.originalUrl}, Updating user profile.`);

    User.update(user, 
        {
            where: {id: id},
            include: [
                {
                    model: Role,
                    attributes: ['id', 'title'],
                    through: {
                        attributes: []
                    }
                }
            ]
        })
        .then(response => {
            if (response[0] === 0) {
                res.status(HttpStatus.OK.code)
                    .send(new Response(HttpStatus.OK.code,HttpStatus.OK.message,`Cannot update account with id=${id}. Maybe account was not found or req.body is empty!`));
                return;
            }
            User.findByPk(id).then(data=>{
                const {password, ...user} = data.dataValues;
                res.status(HttpStatus.OK.code)
                    .send(new Response(HttpStatus.OK.code,HttpStatus.OK.message,`Account updated`, user));

            })
        })
        .catch(err => {
            if (err.name === 'SequelizeUniqueConstraintError') {
                res.status(HttpStatus.FORBIDDEN.code)
                    .send(new Response(HttpStatus.FORBIDDEN.code,HttpStatus.FORBIDDEN.message,`Phone number is already used in an other account` ));
            } else {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                    .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code,HttpStatus.INTERNAL_SERVER_ERROR.message,`Error updating account with id = ${id}.`));
            }
        });
}

exports.updatePassword = async (req, res) => {
    const id = req.params.id;

    const oldPassword = req.body.oldPassword??null;
    const newPassword = req.body.newPassword??null;

    if (id==null || oldPassword==null || newPassword==null) {
        res.status(HttpStatus.NO_CONTENT.code)
            .send(new Response(HttpStatus.NO_CONTENT.code,HttpStatus.NO_CONTENT.message,`Content can not be empty!` ));
        return;
    }

    const userIdConnected = req.user.id;

    const userId = await User.findOne({
        where: {
            id : id
        }
    })

    if(userIdConnected != userId.id ){
        res.status(HttpStatus.FORBIDDEN.code).send(
            new Response(
                HttpStatus.FORBIDDEN.code,
                HttpStatus.FORBIDDEN.message,
                'You\'re not the owner of those account'
            )
        )
    }

    logger.info(`${req.method} ${req.originalUrl}, Updating user password.`);

    User.findByPk(id,
        {
            include: [
                {
                    model: Role,
                    attributes: ['id', 'title'],
                    through: {
                        attributes: []
                    }
                }
            ]
        })
        .then(data => {
            bcrypt.compare(oldPassword, data.password, (err, result)=> {
                if (!result){
                    res.status(HttpStatus.OK.code)
                        .send(new Response(HttpStatus.OK.code,HttpStatus.OK.message,`Old password is incorrect!`));
                    return;
                }

                bcrypt.hash(newPassword, constante.SALT_HASH_KEY, (err, hash)=> {
                    if (err) {
                        logger.error(err.message);
                        return;
                    }

                    if (newPassword === oldPassword) {
                        res.status(HttpStatus.OK.code)
                            .send(new Response(HttpStatus.OK.code,HttpStatus.OK.message,`New password must be different from old password!`));
                        return;
                    }

                    User.update({password: hash}, 
                        {
                            where: {id: id},
                            include: [
                                {
                                    model: Role,
                                    attributes: ['id', 'title'],
                                    through: {
                                        attributes: []
                                    }
                                }
                            ]
                        })
                        .then(response => {
                            if (response[0] === 0) {
                                res.status(HttpStatus.OK.code)
                                    .send(new Response(HttpStatus.OK.code,HttpStatus.OK.message,`Cannot update account with id=${id}. Maybe account was not found or req.body is empty!`));
                                return;
                            }
                            User.findByPk(id,
                                {
                                    include: [
                                        {
                                            model: Role,
                                            attributes: ['id', 'title'],
                                            through: {
                                                attributes: []
                                            }
                                        }
                                    ]
                                }).then(data=>{
                                const {password, ...user} = data.dataValues;
                                res.status(HttpStatus.OK.code)
                                    .send(new Response(HttpStatus.OK.code,HttpStatus.OK.message,`Password updated`, user));

                            })
                        })
                        .catch(err => {
                            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                                .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code,HttpStatus.INTERNAL_SERVER_ERROR.message,`Error changing password with id = ${id} `));
                        });

                });
            });
        })
        .catch(err => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code,HttpStatus.INTERNAL_SERVER_ERROR.message,`Error retrieving account with id = ${id} `));
        });

}

exports.deleteUser = async (req, res) => {
    const id = req.params.id

    const userIdConnected = req.user.id;

    const userId = await User.findOne({
        where: {
            id : id
        }
    })

    if(userIdConnected != userId.id ){
        res.status(HttpStatus.FORBIDDEN.code).send(
            new Response(
                HttpStatus.FORBIDDEN.code,
                HttpStatus.FORBIDDEN.message,
                'You\'re not the owner of those account'
            )
        )
        return;
    }
    
    logger.info(`${req.method} ${req.originalUrl}, Deleting user.`);
    User.update(
        {isActivated: false, deletedAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        {
            where : {id: id},
            include: [
                {
                    model: Role,
                    attributes: ['id', 'title'],
                    through: {
                        attributes: []
                    }
                }
            ]
        }
    )
    .then(response => {
    if (response[0] == 0) {
        res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code,HttpStatus.BAD_REQUEST.message,`Cannot delete User with id=${id}. Maybe User was not found!` ));
        return;
    }
    res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code,HttpStatus.OK.message,`The account deletion request has been sent successfully!` ));
    }).catch(error => {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(HttpStatus.FORBIDDEN.code)
                .send(new Response(HttpStatus.FORBIDDEN.code,HttpStatus.FORBIDDEN.message,`Account already deleted` ));
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code,HttpStatus.INTERNAL_SERVER_ERROR.message,`Some error occurred while creating the account.`));
        }
    })
}

exports.restoreUserDeleted = async (req, res) => {
    const id = req.params.id;
    User.findOne({
        where: {
            id: id
        },
        include: [
            {
                model: Role,
                attributes: ['id', 'title'],
                through: {
                    attributes: []
                }
            }
        ],
        paranoid: false,
    })
    .then((data) => {
        if(data){
            User.restore();
            res.status(HttpStatus.ACCEPTED.code).send(
                new Response(
                    HttpStatus.ACCEPTED.code,
                    HttpStatus.ACCEPTED.message,
                    'User has been successfully restored',
                    data
                )
            )
        }
    })
    .catch(error => {
        console.log(error);
        if(error.name === "SequelizeUniqueConstraintError"){
            res.status(HttpStatus.NOT_FOUND.code).send(
                new Response(
                    HttpStatus.NOT_FOUND.code,
                    HttpStatus.NOT_FOUND.message,
                    `Unable to find or restore the user account with the id value ${id}!`
                )
            )
        }
        else{
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
                new Response(
                    HttpStatus.INTERNAL_SERVER_ERROR.code,
                    HttpStatus.INTERNAL_SERVER_ERROR.message,
                    `Some error occurred while deleting the Parking.`
                )
            );
        }
    })
}

exports.deleteUserByAdmin = async (req, res) => {
    const id = req.params.id

    const userId = await User.findOne({
        where: {
            id : id
        }
    })

    if(!userId.id ){
        res.status(HttpStatus.FORBIDDEN.code).send(
            new Response(
                HttpStatus.FORBIDDEN.code,
                HttpStatus.FORBIDDEN.message,
                "User not found"
            )
        )
        return;
    }
    
    logger.info(`${req.method} ${req.originalUrl}, Deleting user.`);
    User.update(
        {isActivated: false ,deletedAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        {
            where : {id: id},
            include: [
                {
                    model: Role,
                    attributes: ['id', 'title'],
                    through: {
                        attributes: []
                    }
                }
            ]
        }
    )
    .then(response => {
    if (response[0] == 0) {
        res.status(HttpStatus.BAD_REQUEST.code)
            .send(new Response(HttpStatus.BAD_REQUEST.code,HttpStatus.BAD_REQUEST.message,`Cannot delete User with id=${id}. Maybe User was not found!` ));
        return;
    }
    res.status(HttpStatus.OK.code)
            .send(new Response(HttpStatus.OK.code,HttpStatus.OK.message,`The account deletion request has been sent successfully!` ));
    }).catch(error => {
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(HttpStatus.FORBIDDEN.code)
                .send(new Response(HttpStatus.FORBIDDEN.code,HttpStatus.FORBIDDEN.message,`Account already deleted` ));
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
                .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code,HttpStatus.INTERNAL_SERVER_ERROR.message,`Some error occurred while creating the account.`));
        }
    })
}

// exports.deleteUser = (req, res) => {
//     const id = req.params.id
//     const currentDate = new Date().toLocaleDateString();
//     const user={
//         firstName: "Deleted-RGPD",
//         lastName: "Deleted-RGPD",
//         picture: "profile_picture/default.png",
//         phone: `${UUID.v4()}`,
//         email: `${currentDate}@Deleted.RGPD`,
//         address: "Deleted-RGPD",
//         password: "Deleted-RGPD",
//         isActivated: false
//     }

//     logger.info(`${req.method} ${req.originalUrl}, Deleting user.`);
//     User.update(user, {where: {id: id}}).then(response => {
//         if (response[0] === 0) {
//             res.status(HttpStatus.NO_CONTENT.code)
//                 .send(new Response(HttpStatus.NO_CONTENT.code,HttpStatus.NO_CONTENT.message,`Cannot delete User with id=${id}. Maybe User was not found!` ));
//             return;
//         }
//         res.status(HttpStatus.OK.code)
//             .send(new Response(HttpStatus.OK.code,HttpStatus.OK.message,`Account deleted successfully!` ));
//     }).catch(error => {
//         if (error.name === 'SequelizeUniqueConstraintError') {
//             res.status(HttpStatus.FORBIDDEN.code)
//                 .send(new Response(HttpStatus.FORBIDDEN.code,HttpStatus.FORBIDDEN.message,`Account already deleted` ));
//         } else {
//             res.status(HttpStatus.INTERNAL_SERVER_ERROR.code)
//                 .send(new Response(HttpStatus.INTERNAL_SERVER_ERROR.code,HttpStatus.INTERNAL_SERVER_ERROR.message,`Some error occurred while creating the account.`));
//         }
//     })
// }
