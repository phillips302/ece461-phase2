import express, { Request, Response } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { getPackageInfo, resetState } from '../controllers/packageController.js';
import bodyParser from "body-parser";
import { PackageQuery, EnumerateOffset, PackageMetadata } from "./types.js";
import packageRoutes from "./packageRoutes.js";

const router = express.Router();

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/packages', getPackageInfo); //redo this to be post

//router.delete('/reset', resetState);

router.use('/package', packageRoutes);




// const app = express();
// app.use(bodyParser.json());

// Mock database for packages

// Endpoint: GET /packages
// app.post("/packages", (req: Request, res: Response) => {
//   const queries: PackageQuery[] = req.body;

//   if (!Array.isArray(queries) || queries.length === 0) {
//     return res.status(400).json({ message: "Invalid request body format." });
//   }

//   // Pagination handling
//   const offsetParam = req.query.offset;
//   const offset = offsetParam ? parseInt(offsetParam as string, 10) : 0;
//   const limit = 10;

//   // Filter packages based on the queries provided
//   let results: PackageMetadata[] = [];
//   for (const query of queries) {
//     // "*" wildcard fetches all packages
//     if (query.name === "*") {
//       results = packageDatabase;
//       break;
//     } else {
//       const filteredPackages = packageDatabase.filter(
//         (pkg) =>
//           pkg.Name.toLowerCase() === query.name.toLowerCase() &&
//           (!query.version || pkg.Version === query.version)
//       );
//       results = results.concat(filteredPackages);
//     }
//   }

//   // Paginate results
//   const paginatedResults = results.slice(offset, offset + limit);

//   // Handle "Too many packages returned" response
//   if (paginatedResults.length > limit) {
//     return res.status(413).json({
//       message: "Too many packages returned.",
//     });
//   }

//   // Set the offset header for the next page, if any
//   res.set("offset", (offset + limit).toString());

//   // Response
//   return res.status(200).json(paginatedResults);
// });

// // Additional response for missing or invalid auth token
// app.use((req: Request, res: Response) => {
//   res.status(403).json({
//     message: "Authentication failed due to invalid or missing AuthenticationToken.",
//   });
// });

export default router;