import express from "express"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import cors from "cors"
import dotenv from "dotenv"
  

dotenv.config()

const mongoURI = process.env.MONGO_URL

mongoose.connect(mongoURI).then(
    () => {
        console.log("Connected to MongoDB Cluster")
    }
)


const app = express()

app.use(cors())


app.use(express.json())



// app.use(
//     // attach user to req if a valid Bearer token is present
//     (req, res, next) => {
//         const authorizationHeader = req.header("Authorization");

//         if (!authorizationHeader) return next();

//         const token = authorizationHeader.replace("Bearer ", "");

//         jwt.verify(token, process.env.JWT_SECRET, (error, content) => {
//             if (error || !content) {
//                 // invalid token — do not block here, just continue without user
//                 console.log("invalid token");
//                 return next();
//             }

//             req.user = content;
//             next();
//         });
//     }
// )

// app.use("/api/admin", adminRouter)  
// app.use("/api/customers", customerRouter)
// app.use("/api/suppliers", supplierRouter)
app.use("/api/stocks", stockRouter)
// app.use("/api/orders", orderRoutes)
// app.use("/api/products", productRouter)
// app.use("/api/requirements", requirementRoutes)
// app.use("/api/quotations", quotationRoutes)
// app.use("/api/invoices", invoiceRoutes)

// Centralized error handler
// app.use(errorHandler)


app.listen(5900,
    () => {
        console.log("server is running")
    }
)