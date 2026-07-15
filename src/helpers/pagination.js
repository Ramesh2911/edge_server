const getPagination = (req) => {

    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    return {

        page,

        limit,

        offset

    };

};

const paginationData = (

    total,

    page,

    limit

) => {

    return {

        total,

        currentPage: page,

        perPage: limit,

        totalPages: Math.ceil(total / limit),

        hasNextPage: page < Math.ceil(total / limit),

        hasPreviousPage: page > 1

    };

};

module.exports = {

    getPagination,

    paginationData

};