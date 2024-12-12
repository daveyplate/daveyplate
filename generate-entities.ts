import ts from 'typescript'
import path from 'path'

function extractTablesTypes() {
    // Path to the TypeScript file
    const filePath = path.resolve(__dirname, 'database.types.ts')

    // Create a TypeScript program
    const program = ts.createProgram([filePath], {})

    const typeChecker = program.getTypeChecker()
    const tables: string[] = []

    // Visit each node in the source file
    function visit(node: ts.Node) {
        if (ts.isTypeAliasDeclaration(node) && node.name.text === 'Database') {
            const type = typeChecker.getTypeAtLocation(node)
            const properties = typeChecker.getPropertiesOfType(type)

            properties.forEach((property) => {
                if (property.name === 'public') {
                    const publicType = typeChecker.getTypeOfSymbolAtLocation(property, node)
                    const publicProperties = typeChecker.getPropertiesOfType(publicType)

                    publicProperties.forEach((publicProp) => {
                        if (publicProp.name === 'Tables') {
                            const tablesType = typeChecker.getTypeOfSymbolAtLocation(publicProp, node)
                            const tableSymbols = typeChecker.getPropertiesOfType(tablesType)

                            tableSymbols.forEach((symbol) => {
                                tables.push(symbol.name)
                            })
                        }
                    })
                }
            })
        }

        ts.forEachChild(node, visit)
    }

    // Get the source file's AST and apply visitor
    const sourceFile = program.getSourceFile(filePath)
    if (sourceFile) {
        ts.forEachChild(sourceFile, visit)
    }

    return tables
}

const tables = extractTablesTypes()
console.log('Tables:', tables)