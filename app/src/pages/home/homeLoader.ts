import type { Table, Menu, HomeLoaderData } from "../../../../share/details";
import { getTables, getMenus } from "../../api/fetchdata";

export const homeLoader = async (): Promise<HomeLoaderData> => {
    try {
        const [resTables, resMenus] = await Promise.all([
            getTables().catch((err) => {
                console.error("Failed to fetch tables:", err);
                return null;
            }),
            getMenus().catch((err) => {
                console.error("Failed to fetch menus:", err);
                return null;
            })
        ]);

        const tables: Table[] = resTables?.data || (Array.isArray(resTables) ? resTables : []);
        const menus: Menu[] = resMenus?.data || (Array.isArray(resMenus) ? resMenus : []);

        return {
            resTables: tables,
            resMenus: menus
        };
    } catch (error) {
        console.error("Failed to load home data:", error);
        return {
            resTables: [],
            resMenus: []
        };
    }
};