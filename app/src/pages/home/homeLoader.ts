import type { Table, Menu, HomeLoaderData } from "../../../../share/details";
import { getTables, getMenus } from "../../api/fetchdata";

export const homeLoader = async (): Promise<HomeLoaderData> => {
    try {
        const [loaderTables, loaderMenus] = await Promise.all([
            getTables().catch((err) => {
                console.error("Failed to fetch tables:", err);
                return null;
            }),
            getMenus().catch((err) => {
                console.error("Failed to fetch menus:", err);
                return null;
            })
        ]);

        const tables: Table[] = loaderTables?.data || (Array.isArray(loaderTables) ? loaderTables : []);
        const menus: Menu[] = loaderMenus?.data || (Array.isArray(loaderMenus) ? loaderMenus : []);

        // console.log(tables)
        // console.log(menus)

        return {
            loaderTables: tables,
            loaderMenus: menus
        };
    } catch (error) {
        console.error("Failed to load home data:", error);
        return {
            loaderTables: [],
            loaderMenus: []
        };
    }
};