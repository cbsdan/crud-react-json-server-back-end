const jsonServer = require('json-server')
const multer = require('multer');
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        try {
            cb(null, 'public/images')
        } catch (err) {
            cb(new Error('Error in setting the file destination'), null)
        }
    },
    filename: function (req, file, cb) {
        try {
            let date = new Date()
            let imageFilename = date.getTime() + "_" + file.originalname
            req.body.imageFilename = imageFilename
            cb(null, imageFilename)
        } catch (err) {
            cb(new Error('Error in setting the filename'), null)
        }
    }
})

const bodyParser = multer({ storage: storage }).any()

// To handle POST, PUT and PATCH you need to use a body-parser
server.use(bodyParser)

// Error-handling middleware
server.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Handle multer-specific errors
        return res.status(500).json({ message: "Multer error: " + err.message });
    } else if (err) {
        // Handle general errors
        return res.status(500).json({ message: "Server error: " + err.message });
    }
    next();
});

server.post("/products", async (req, res, next) => {
    try {
        console.log("Request received:");
        console.log("Headers:", req.headers);
        console.log("Original Body:", req.body);
        
        let date = new Date()
        req.body.createdAt = date.toISOString()

        if (req.body.price) {
            req.body.price = Number(req.body.price);
        }

        let hasErrors = false;
        let errors = {};

        // Validation
        if (req.body.name.length < 2) {
            hasErrors = true;
            errors.name = "The name length should be at least 2 characters";
        }
        if (req.body.brand.length < 2) {
            hasErrors = true;
            errors.brand = "The brand length should be at least 2 characters";
        }
        if (req.body.category.length < 2) {
            hasErrors = true;
            errors.category = "The category length should be at least 2 characters";
        }
        if (req.body.price <= 0) {
            hasErrors = true;
            errors.price = "The price is not valid";
        }
        if (req.body.description.length < 10) {
            hasErrors = true;
            errors.description = "The description length should be at least 10 characters";
        }

        if (hasErrors) {
            res.status(400).jsonp(errors);
            return
        }

        // Combine files into the req.body object
        req.files.forEach(file => {
            req.body[file.fieldname] = file.filename;
        });

        console.log("Processed Body:", req.body);

        // Continue to JSON Server router
        next();
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({ message: "An error occurred on the server." });
        return
    }
});


// Use default router
server.use(router)
server.listen(4000, () => {
  console.log('JSON Server is running')
})