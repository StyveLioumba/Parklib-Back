const ParkingParticulier = require("../models").ParkingParticulier;
const logger = require("../utils/logger.util.js");
const HttpStatus = require("../utils/httpStatus.util.js");
const Response = require("../utils/response.util.js");
const { Op } = require("sequelize");

// const apiGouvAdresseService = require("../services/apiGouvAdresse.services");
// const uploadFile = require("../middleware/uploadPictureParkingParticulier.middleware");

exports.findAllParkingParticulier = (req, res) => {
    logger.info(
        `${req.method} ${req.originalUrl}, Fetching ALL parkings particuliers.`
    );
    ParkingParticulier.findAll({
        order: [["createdAt", "DESC"]],
    })
        .then((data) => {
            const parkingParticulierAllList = data.map((parking) => {
                return parking;
            });
            if(data){
                res.status(HttpStatus.OK.code).send(
                    new Response(
                        HttpStatus.OK.code,
                        HttpStatus.OK.message,
                        `ParkingParticuliers retrieved`,
                        parkingParticulierAllList
                    )
                );
            }
            else{
                res.status(HttpStatus.NOT_FOUND.code).send(
                    new Response(
                        HttpStatus.NOT_FOUND.code,
                        HttpStatus.NOT_FOUND.message,
                        `ParkingParticuliers not found`,
                    )
                );
            }
        })
        .catch((err) => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
                new Response(
                    HttpStatus.INTERNAL_SERVER_ERROR.code,
                    HttpStatus.INTERNAL_SERVER_ERROR.message,
                    `Some error occurred while retrieving parkings`
                )
            );
        });
};

exports.findOneParkingParticulier = (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.status(HttpStatus.BAD_REQUEST.code).send(
            new Response(
                HttpStatus.BAD_REQUEST.code,
                HttpStatus.BAD_REQUEST.message,
                `Id can not be empty!`
            )
        );
        return;
    }
    logger.info(`${req.method} ${req.originalUrl}, Fetching parking #${id}.`);
    ParkingParticulier.findByPk(id)
        .then((data) => {
            if(data){
                res.status(HttpStatus.OK.code).send(
                    new Response(
                        HttpStatus.OK.code,
                        HttpStatus.OK.message,
                        `Parking retrieved !`,
                        data
                    )
                );
            }
            else{
                res.status(HttpStatus.NOT_FOUND.code).send(
                    new Response(
                        HttpStatus.NOT_FOUND.code,
                        HttpStatus.NOT_FOUND.message,
                        `Parking not found !`,
                    )
                );
            }
        })
        .catch((err) => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
                new Response(
                    HttpStatus.INTERNAL_SERVER_ERROR.code,
                    HttpStatus.INTERNAL_SERVER_ERROR.message,
                    `Error retrieving parking with id = ${id} `
                )
            );
        });
};

exports.findAllParkingParticulierByUser = (req, res) => {
    const id = req.params.id;
    if (!id) {
        res.status(HttpStatus.BAD_REQUEST.code).send(
            new Response(
                HttpStatus.BAD_REQUEST.code,
                HttpStatus.BAD_REQUEST.message,
                `Id can not be empty!`
            )
        );
        return;
    }
    logger.info(
        `${req.method} ${req.originalUrl}, Fetching all parkings for User #${id}.`
    );
    ParkingParticulier.findAll({
        where: { user_id: id },
        order: [["createdAt", "DESC"]],
    })
        .then((data) => {
            if(data){
                res.status(HttpStatus.OK.code).send(
                    new Response(
                        HttpStatus.OK.code,
                        HttpStatus.OK.message,
                        `Parkings retrieved !`,
                        data
                    )
                );
            }
            else{
                res.status(HttpStatus.NOT_FOUND.code).send(
                    new Response(
                        HttpStatus.NOT_FOUND.code,
                        HttpStatus.NOT_FOUND.message,
                        `Parkings not found !`,
                        data
                    )
                );
            }
        })
        .catch((err) => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
                new Response(
                    HttpStatus.INTERNAL_SERVER_ERROR.code,
                    HttpStatus.INTERNAL_SERVER_ERROR.message,
                    `Error retrieving parking for User #${id} `
                )
            );
        });
};

exports.findActivatedParkingParticulierByParams = (req, res) => {
    const zipCode = req.body.zipCode;
    const city = req.body.city;
    const adress = req.body.address;

    let parking = {};

    if (zipCode) {
        parking.zipCode = zipCode;
    }
    if (city) {
        parking.city = city;
    }
    if(adress){
        parking.adress = adress
    }
    parking.isActivated = true;

    console.log("Searching : " + parking);

    logger.info(
        `${req.method} ${req.originalUrl}, Fetching all parkings with custom params.`
    );
    ParkingParticulier.findAll({
        where: parking,
        order: [["createdAt", "DESC"]],
    })
        .then((data) => {
            if(data){
                res.status(HttpStatus.OK.code).send(
                    new Response(
                        HttpStatus.OK.code,
                        HttpStatus.OK.message,
                        `Parkings retrieved !`,
                        data
                    )
                );
            }
            else{
                res.status(HttpStatus.NOT_FOUND.code).send(
                    new Response(
                        HttpStatus.NOT_FOUND.code,
                        HttpStatus.NOT_FOUND.message,
                        `Parkings not found !`,
                    )
                );
            }
        })
        .catch((err) => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
                new Response(
                    HttpStatus.INTERNAL_SERVER_ERROR.code,
                    HttpStatus.INTERNAL_SERVER_ERROR.message,
                    `Error retrieving parkings`
                )
            );
        });
};

exports.addParkingParticulier = async (req, res) => {
    if (
        !req.body.address ||
        !req.body.zipCode ||
        !req.body.city ||
        !req.body.longitude ||
        !req.body.lattitude
    ) {
        res.status(HttpStatus.BAD_REQUEST.code).send(
            new Response(
                HttpStatus.BAD_REQUEST.code,
                HttpStatus.BAD_REQUEST.message,
                `Content can not be empty!`
            )
        );
        return;
    }

    const {address, zipCode, city, longitude, lattitude} = req.body;
    const UserId = req.user.id

    const parking = { 
        address,
        zipCode,
        city,
        longitude,
        lattitude,
        UserId: UserId
     };

    logger.info(
        `${req.method} ${req.originalUrl}, Creating new parking particulier.`
    );

    ParkingParticulier.create(parking)
    .then( async (data) => {
        if(typeof(req.body.address) === "string" && 
            typeof(req.body.zipCode) === "string" &&
            typeof(req.body.city) === "string" &&
            typeof(req.body.longitude) === "number" &&
            typeof(req.body.lattitude) === "number"
        ){
            res.status(HttpStatus.CREATED.code).send(
                new Response(
                    HttpStatus.CREATED.code,
                    HttpStatus.CREATED.message,
                    'Parking is created',
                    data
                )
            )
        }
    })
    .catch((error) => {
        console.log(error)
        if(error.name === 'SequelizeUniqueConstraintError'){
            res.status(HttpStatus.CONFLICT.code).send(
                new Response(
                    HttpStatus.CONFLICT.code,
                    HttpStatus.CONFLICT.message,
                    `The parking lot already exists!.`
                )
            );
        }
        else{
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
                new Response(
                    HttpStatus.INTERNAL_SERVER_ERROR.code,
                    HttpStatus.INTERNAL_SERVER_ERROR.message,
                    `Some error occurred while creating the parking.`
                )
            );
        }
    });
};

exports.updateParkingParticulier = async (req, res) => {
    const id = req.params.id;

    const address = req.body.address;
    const zipCode = req.body.zipCode;
    const city = req.body.city;

    let parking = {};

    if (address) {
        parking.address = address;
    }
    if (zipCode) {
        parking.zipCode = zipCode;
    }
    if (city) {
        parking.city = city;
    }

    if (!id || Object.keys(parking).length === 0) {
        res.status(HttpStatus.BAD_REQUEST.code).send(
            new Response(
                HttpStatus.BAD_REQUEST.code,
                HttpStatus.BAD_REQUEST.message,
                parking,
                `Content can not be empty!`
            )
        );
    }

    const UserIdConnected = req.user.id;

    const UserIdParking = await ParkingParticulier.findOne({
        where: {
            id : id
        }
    });

    if(UserIdConnected !== UserIdParking.UserId){
        res.status(HttpStatus.FORBIDDEN.code).send(
            new Response(
                HttpStatus.FORBIDDEN.code,
                HttpStatus.FORBIDDEN.message,
                'You\'re not the owner of those parking'
            )
        )
    }

    logger.info(`${req.method} ${req.originalUrl}, Updating parking.`);

    ParkingParticulier.update(parking, { where: { id: id } })
        .then((response) => {
            if (response[0] === 0) {
                res.status(HttpStatus.NOT_FOUND.code).send(
                    new Response(
                        HttpStatus.NOT_FOUND.code,
                        HttpStatus.NOT_FOUND.message,
                        `Cannot update account with id=${id}. Maybe parking was not found!`
                    )
                );
                return;
            }
            ParkingParticulier.findByPk(id).then((data) => {
                res.status(HttpStatus.OK.code).send(
                    new Response(
                        HttpStatus.OK.code,
                        HttpStatus.OK.message,
                        `Parking updated`,
                        data
                    )
                );
            });
        })
        .catch((error) => {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
                new Response(
                    HttpStatus.INTERNAL_SERVER_ERROR.code,
                    HttpStatus.INTERNAL_SERVER_ERROR.message,
                    `Error updating Parking with id = ${id}.`
                )
            );
        });
};

exports.deleteParkingParticulier = async (req, res) => {
    const id = req.params.id;

    const UserIdConnected = req.user.id;

    const parking = await ParkingParticulier.findOne({
        where : {
            id: id
        }
    });

    if(UserIdConnected !== parking.UserId){
        res.status(HttpStatus.FORBIDDEN.code).send(
            new Response(
                HttpStatus.FORBIDDEN.code,
                HttpStatus.FORBIDDEN.message,
                'You\'re not the owner of those parking'
            )
        )
    }

    logger.info(`${req.method} ${req.originalUrl}, Deleting parking.`);
    ParkingParticulier.destroy({ where: { id: id } })
    .then(async (response) => {
        if (response[0] === 0) {
            res.status(HttpStatus.NOT_FOUND.code).send(
                new Response(
                    HttpStatus.NOT_FOUND.code,
                    HttpStatus.NOT_FOUND.message,
                    `Cannot delete Parking with id=${id}. Maybe Parking was not found!`
                )
            );
        }
        else{
            res.status(HttpStatus.NO_CONTENT.code).send(
                new Response(
                    HttpStatus.NO_CONTENT.code,
                    HttpStatus.NO_CONTENT.message,
                    `Parking and role was deleted successfully!`
                )
            );
        }
    })
    .catch((error) => {
        console.log(error)
        res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
            new Response(
                HttpStatus.INTERNAL_SERVER_ERROR.code,
                HttpStatus.INTERNAL_SERVER_ERROR.message,
                `Some error occurred while deleting the Parking.`
            )
        );
    });
};

/* Suppression du rôle lors de la suppression du parking
const parking = await ParkingParticulier.findAll({where : {UserId : UserIdConnected}});
console.log('parking = 0', parking.length == 0)
if(parking.length == 0){
    
    const findRoleUser = await RoleUser.findAll({where : {UserId : UserIdConnected}});

    const findRoleId = findRoleUser.find(roleUser => roleUser.RoleId === 2
    if(findRoleId){
        RoleUser.destroy({
            where : {
                RoleId : findRoleId.RoleId
            }
        })
        .then(() => {
            res.status(HttpStatus.NO_CONTENT.code).send(
                new Response(
                    HttpStatus.NO_CONTENT.code,
                    HttpStatus.NO_CONTENT.message,
                    `Parking and role was deleted successfully!`
                )
            );
        })
        .catch(error => {
            console.log("error", error);
            res.status(HttpStatus.BAD_REQUEST.code).send(
                new Response(
                    HttpStatus.BAD_REQUEST.code,
                    HttpStatus.BAD_REQUEST.message,
                    `Bad request`
                )
            );
        })
    }
}
else{
    res.status(HttpStatus.NO_CONTENT.code).send(
        new Response(
            HttpStatus.NO_CONTENT.code,
            HttpStatus.NO_CONTENT.message,
            `Parking deleted successfully!`
        )
    );
}*/

/* Ajout d'un rôle lors de la création d'un parking
const role = await Role.findOne({ where: { title: "Bailleur" } });
const parking = await ParkingParticulier.findAll({where : {UserId : UserId}});
console.log("parking", parking.length)

if(parking.length == 1 ){
    if(role){
        let roleUser = {};
        roleUser = {
            UserId: UserId ? UserId : null,
            RoleId: role.id ? role.id : null
        }
        for(value in roleUser){
            if(!roleUser[value]){
                res.status(HttpStatus.BAD_REQUEST.code).send(
                    new Response(
                        HttpStatus.BAD_REQUEST.code,
                        HttpStatus.BAD_REQUEST.message,
                        'Content cannot be empty'
                    )
                )
            }
        }
        RoleUser.create(roleUser)
        .then(response => {
            if(response[0]===0){
                res.status(HttpStatus.NOT_FOUND.code).send(
                    new Response(
                        HttpStatus.NOT_FOUND.code,
                        HttpStatus.NOT_FOUND.message,
                        'Any response for RoleUser was returned'
                    )
                )
            }
            res.status(HttpStatus.CREATED.code).send(
                new Response(
                    HttpStatus.CREATED.code,
                    HttpStatus.CREATED.message,
                    'Parking and RoleUser is created',
                    data
                )
            )
        })
        .catch(err => {
            console.log("err1", err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
                new Response(
                    HttpStatus.INTERNAL_SERVER_ERROR.code,
                    HttpStatus.INTERNAL_SERVER_ERROR.message,
                    'An internal error has occurred'
                )
            )
        })
    }
    else{
        res.status(HttpStatus.NOT_FOUND.code).send(
            new Response(
                HttpStatus.NOT_FOUND.code,
                HttpStatus.NOT_FOUND.message,
                `Any role ${role.title} was found`
            )
        )
    }
}
else{
    res.status(HttpStatus.CREATED.code).send(
        new Response(
            HttpStatus.CREATED.code,
            HttpStatus.CREATED.message,
            'Parking is created',
            data
        )
    )
}*/

// exports.restoreParkingDeleted = (req, res) => {
//     ParkingParticulier.findOne({
//         where: {
//             id: req.params.id
//         },
//         paranoid: false,
//       })
//       .then((data) => {
//         if(data){
//             ParkingParticulier.restore();
//             res.status(HttpStatus.ACCEPTED.code).send(
//                 new Response(
//                     HttpStatus.ACCEPTED.code,
//                     HttpStatus.ACCEPTED.message,
//                     data,
//                     'The parking lot has been successfully restored'
//                 )
//             )
//         }
//       })
//       .catch(error => {
//         console.log(error);
//         if(error.name === "SequelizeUniqueConstraintError"){
//             res.status(HttpStatus.NOT_FOUND.code).send(
//                 new Response(
//                     HttpStatus.NOT_FOUND.code,
//                     HttpStatus.NOT_FOUND.message,
//                     'The parking lot cannot be found'
//                 )
//             )
//         }
//         else{
//             res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
//                 new Response(
//                     HttpStatus.INTERNAL_SERVER_ERROR.code,
//                     HttpStatus.INTERNAL_SERVER_ERROR.message,
//                     `Some error occurred while deleting the Parking.`
//                 )
//             );
//         }
//       })
// }

// exports.deleteParkingParticulier = (req, res) => {
//     const id = req.params.id;
//     const parking = {
//         address: "Deleted-RGPD",
//         zipCode: "Deleted-RGPD",
//         city: "Deleted-RGPD",
//         lattitude: 0.0,
//         longitude: 0.0,
//         isActivated: false,
//     };

//     logger.info(`${req.method} ${req.originalUrl}, Deleting parking.`);
//     ParkingParticulier.update(parking, { where: { id: id } })
//         .then((response) => {
//             if (response[0] === 0) {
//                 res.status(HttpStatus.NOT_FOUND.code).send(
//                     new Response(
//                         HttpStatus.NOT_FOUND.code,
//                         HttpStatus.NOT_FOUND.message,
//                         `Cannot delete Parking with id=${id}. Maybe Parking was not found!`
//                     )
//                 );
//                 return;
//             }
//             res.status(HttpStatus.NO_CONTENT.code).send(
//                 new Response(
//                     HttpStatus.NO_CONTENT.code,
//                     HttpStatus.NO_CONTENT.message,
//                     `Parking deleted successfully!`
//                 )
//             );
//         })
//         .catch((error) => {
//             if (error.name === "SequelizeUniqueConstraintError") {
//                 res.status(HttpStatus.FORBIDDEN.code).send(
//                     new Response(
//                         HttpStatus.FORBIDDEN.code,
//                         HttpStatus.FORBIDDEN.message,
//                         `Parking already deleted`
//                     )
//                 );
//             } else {
//                 res.status(HttpStatus.INTERNAL_SERVER_ERROR.code).send(
//                     new Response(
//                         HttpStatus.INTERNAL_SERVER_ERROR.code,
//                         HttpStatus.INTERNAL_SERVER_ERROR.message,
//                         `Some error occurred while deleting the Parking.`
//                     )
//                 );
//             }
//         });
// };

// const uploadParkingPicture = async (req, res) => {
//     try {
//         await uploadFile(req, res);

//         if (req.file == undefined) {
//             // return res.status(400).send({ message: "Please upload a file!" });
//             return {
//                 code: 400,
//                 message: "Please upload a file!",
//             };
//         }

//         //   res.status(200).send({
//         //     message: "Uploaded the file successfully: " + req.file.originalname,
//         //   });
//         return {
//             code: 200,
//             message: "Uploaded the file successfully: " + req.file.originalname,
//         };
//     } catch (err) {
//         if (err.code == "LIMIT_FILE_SIZE") {
//             // return res.status(500).send({
//             //     message: "File size cannot be larger than 2MB!",
//             // });
//             return {
//                 code: 500,
//                 message: "File size cannot be larger than 2MB!",
//             };
//         }
//         // res.status(500).send({
//         //     message: `Could not upload the file: ${req.file.originalname}. ${err}`,
//         // });
//         return {
//             code: 500,
//             message: `Could not upload the file: ${req.file.originalname}. ${err}`,
//         };
//     }
// };
