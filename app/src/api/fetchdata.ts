
const local_api_url = "http://localhost:8080/boardgame";

export async function getMenus() {
    const response = await fetch(`${local_api_url}/menu`);

    if (!response.ok) {
        throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

export async function getTables() {
    const response = await fetch(`${local_api_url}/table`);

    if (!response.ok) {
        throw new Error(`เกิดข้อผิดพลาดในการดึงข้อมูล: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

