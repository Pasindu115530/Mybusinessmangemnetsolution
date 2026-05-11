import express from "express";
import multer from "multer";
import { 
    addProduct, 
    getAllProducts, 
    getProductById, 
    updateProduct, 
    deleteProduct,
    uploadStocksExcel,
    downloadStockTemplate
} from "../controllers/stockController.js";

const stockRouter = express.Router();

// Multer config for temp file upload
const upload = multer({ dest: 'uploads/' });

stockRouter.post("/addItem" , addProduct);
stockRouter.get("/getItems" , getAllProducts);
stockRouter.get("/getItems/:id" , getProductById);
stockRouter.put("/updateItem/:id" , updateProduct);
stockRouter.delete("/deleteItem/:id" , deleteProduct);

// Excel Routes
stockRouter.post("/uploadExcel", upload.single('file'), uploadStocksExcel);
stockRouter.get("/downloadTemplate", downloadStockTemplate);

export default stockRouter;