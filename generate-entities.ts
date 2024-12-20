import fs from 'fs'
import path from 'path'
import ts from 'typescript'

type SelectConfig = Record<string, string[]>

function lowercaseFirstLetter(str: string): string {
    if (!str) return str
    return str.charAt(0).toLowerCase() + str.slice(1)
}

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

// Load select configurations from entities.config.json if it exists
function loadSelectConfig(): SelectConfig {
    const configPath = path.resolve(__dirname, 'entities.config.json')

    if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8')
        const config = JSON.parse(configContent)
        return config.selects || {}
    }

    return {}
}

// Function to generate content for entities.generated.ts
function generateEntitiesFile(tables: string[], selectConfig: SelectConfig) {
    let content = `import { QueryData, SupabaseClient } from "@supabase/supabase-js"\n`
    content += `import { SWRConfiguration } from "swr"\n\n`

    content += `import { QueryFilters, useEntities, useEntity } from "@/utils/supabase/supabase-swr"\n\n`
    content += `import { createClient } from "@/utils/supabase/component"\n`
    content += `import { Database } from "database.types"\n`

    content += `const supabaseClient: SupabaseClient<Database> = createClient()\n\n`

    content += `export const createQueries = () => {\n`
    content += `    return {\n`

    tables.forEach((table) => {
        const selectParams = selectConfig[table]
            ? `.select("${selectConfig[table].join(',')}")`
            : `.select()`
        content += `        "${table}": supabaseClient.from("${table}")${selectParams},\n`
    })

    content += `    }\n`
    content += `}\n\n`

    tables.forEach((table) => {
        const camelCaseName = toCamelCase(table)
        const className = camelCaseName.endsWith('s') ? camelCaseName.slice(0, -1) : camelCaseName
        content += `export type ${className} = QueryData<ReturnType<typeof createQueries>["${table}"]>[0]\n`
    })

    tables.forEach((table) => {
        const camelCaseName = toCamelCase(table)
        const className = camelCaseName.endsWith('s') ? camelCaseName.slice(0, -1) : camelCaseName
        const useEntityName = className.endsWith('s') ? className.slice(0, -1) : className
        const useEntitiesName = className.endsWith('s') ? className : `${className}s`

        content += `\nexport function use${useEntitiesName}(enabled: boolean | null = true, filters?: QueryFilters<${className}> | null, config?: SWRConfiguration | null) {\n`
        content += `    const result = useEntities<${className}>(enabled ? "${table}" : null, filters, config)\n`
        content += `    return { ...result, ${lowercaseFirstLetter(useEntitiesName)}: result.data }\n`
        content += `}\n`

        content += `\nexport function use${useEntityName}(id?: string | null, filters?: QueryFilters<${className}> | null, config?: SWRConfiguration | null) {\n`
        content += `    const result = useEntity<${className}>((id || filters) ? "${table}" : null, id, filters, config)\n`
        content += `    return { ...result, ${lowercaseFirstLetter(useEntityName)}: result.data }\n`
        content += `}\n`
    })

    fs.writeFileSync(path.resolve(__dirname, 'entities.generated.ts'), content)
}

// Main execution
const tables = extractTablesTypes()
const selectConfig = loadSelectConfig()
generateEntitiesFile(tables, selectConfig)