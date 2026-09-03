import type { Table } from "../../../../share/details";
import { getTables } from "../../api/fetchdata"


export const homeLoader = async () => {
    try {
        const res = await getTables();
        const tables: Table[] = res.data || [];

        console.log("tables:", tables);
        return tables;
    } catch (error) {
        console.error("Failed to load tables:", error);
        return [];
    }
}