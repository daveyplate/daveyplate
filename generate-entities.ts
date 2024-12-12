import fs from 'fs'
import path from 'path'
import ts from 'typescript'

function toCamelCase(str: string): string {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w|_\w)/g, function (match, index) {
            if (+match === 0 || match === '_') return ''
            return match.toUpperCase()
        })
        .replace(/[^a-zA-Z0-9]/g, '')
}

// Load the database.types.ts file and return all table names as a string array
function extractTablesTypes(): string[] {
    const filePath = path.resolve(__dirname, 'database.types.ts')

    // Create a TypeScript program
    const program = ts.createProgram([filePath], {})
    const typeChecker = program.getTypeChecker()
    const tables: string[] = []

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

    const sourceFile = program.getSourceFile(filePath)
    if (sourceFile) {
        ts.forEachChild(sourceFile, visit)
    }

    return tables
}

// Function to generate content for entities.generated.ts
function generateEntitiesFile(tables: string[]) {
    let content = `import { QueryData, SupabaseClient } from "@supabase/supabase-js"\n`
    content += `import { Database } from "database.types"\n`
    content += `import { createClient } from "@/utils/supabase/component"\n`
    content += `import { QueryFilters, useEntities, useEntity } from "@/utils/supabase/supabase-swr"\n\n`

    content += `const supabaseClient: SupabaseClient<Database> = createClient()\n\n`

    content += `export const createQueries = () => {\n`
    content += `    return {\n`

    tables.forEach((table) => {
        content += `        "${table}": supabaseClient.from("${table}").select(),\n`
    })

    content += `    }\n`
    content += `}\n\n`

    tables.forEach((table) => {
        const className = toCamelCase(table)
        content += `export type ${className} = QueryData<ReturnType<typeof createQueries>["${table}"]>\n`
    })

    tables.forEach((table) => {
        const className = toCamelCase(table)
        const useEntityName = className.endsWith('s') ? className.slice(0, -1) : className
        const useEntitiesName = className.endsWith('s') ? className : `${className}s`

        content += `\nexport function use${useEntitiesName}(enabled: boolean | null = true, filters?: QueryFilters | null) {\n`
        content += `    return useEntities<${className}>(enabled ? "${table}" : null, filters)\n`
        content += `}\n`

        content += `\nexport function use${useEntityName}(id?: string | null, filters?: QueryFilters | null) {\n`
        content += `    return useEntity<${className}>((id || filters) ? "${table}" : null, id, filters)\n`
        content += `}\n`
    })

    fs.writeFileSync(path.resolve(__dirname, 'entities.generated.ts'), content)
}

// Main execution
const tables = extractTablesTypes()
generateEntitiesFile(tables)