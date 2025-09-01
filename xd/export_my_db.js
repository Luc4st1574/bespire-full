// export_my_db.js

// List of system databases to exclude from the export
const excludedDbs = ['admin', 'local', 'config'];

// Get all database names
const allDbs = db.getMongo().getDBNames();

allDbs.forEach(dbName => {
    // Skip the databases in our exclusion list
    if (excludedDbs.includes(dbName)) {
        print(`// Skipping system database: ${dbName}`);
        return;
    }

    print(`\n// ----------------------------------------`);
    print(`// DATABASE: ${dbName}`);
    print(`// ----------------------------------------`);

    // Switch to the current database
    const currentDb = db.getSiblingDB(dbName);

    // Get all collection names in the current database
    const collectionNames = currentDb.getCollectionNames();

    collectionNames.forEach(collectionName => {
        print(`\n// ---- Collection: ${dbName}.${collectionName} ----`);

        // Find and print all documents in the collection
        const cursor = currentDb.getCollection(collectionName).find();
        cursor.forEach(doc => {
            // Convert each document to a JSON string and print it
            print(JSON.stringify(doc));
        });
    });
});