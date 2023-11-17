import asyncHandler from "express-async-handler";
import Movie from "../Models/MoviesModel.js";
import { MoviesData } from "../Data/MovieData.js";


// ************** PUBLIC CONTROLLERS **************
// @desc import movies
// @route POST /api/movies/import
// @access Public

const importMovies = asyncHandler(async (req, res) => {
    // first we make sure our Movies table is empty by delete all documents
    await Movie.deleteMany({});
    // then we insert all movies from MoviesData
    const movies = await Movie.insertMany(MoviesData)
    res.status(201).json(movies);
});

// @desc get all movies
// @route GET /api/movies
// @access Public

const getMovies = asyncHandler(async (req, res) => {
    try {
        // filter movies by category, time, language, rate, year and search
        const { category, time, language, rate, year, search } = req.query;
        let query = {
            ...(category && { category }),
            ...(time && { time }),
            ...(language && { language }),
            ...(rate && { rate }),
            ...(year && { year }),
            ...(search && { name: { $regex: search, $options: "i" } }),
        }

        //load more movies functionality
        const page = Number(req.query.pageNumber) || 1;
        const limit = 2;
        const skip = (page - 1) * limit;

        //find movies by query, skip and limit
        const movies = await Movie.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        //get total number of movies
        const count = await Movie.countDocuments(query);

        //send response with movies and total number of movies
        res.json({
            movies,
            page,
            pages: Math.ceil(count / limit),
            totalMovies: count,
        })

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc get movie by id
// @route GET /api/movies/:id
// @access Public

const getMovieById = asyncHandler(async (req, res) => {
    try {
        //find movie by id in database
        const movie = await Movie.findById(req.params.id);
        //if the movie if found send it to the client
        if (movie) {
            res.json(movie);
        }
        //if the movie is not found sned 404 error
        else {
            res.status(404);
            throw new Error("Movie not found");
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

// @desc Get top rated movies
// @route GET /api/movies/rated/top
// @access Public

const getTopRatedMovies = asyncHandler(async (req, res) => {
    try {
        //find top rated movies
        const movies = await Movie.find({}).sort({ rate: -1 });
        //send top rated movies to the client
        res.json(movies);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @desc Get random movies
// @route GET /api/movies/random/all
// @access Public

const getRandomMovies = asyncHandler(async (req, res) => {
    try {
        //find random movies
        const movies = await Movie.aggregate([{ $sample: { size: 8 } }]);
        //send random movies to the client
        res.json(movies);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

export {
    importMovies,
    getMovies,
    getMovieById,
    getTopRatedMovies,
    getRandomMovies,
};

//2h8p