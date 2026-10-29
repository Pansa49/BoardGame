export function Header() {

    return (
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-8 py-4 flex justify-center items-center sticky top-0 z-10">
            <div className="flex items-center gap-3">
                <span className="text-3xl">🎲</span>
                <div>
                    <h1 className="text-xl font-bold tracking-wider text-amber-400 uppercase">Dice & Drinks</h1>
                    <p className="text-xs text-slate-400">บอร์ดเกมคาเฟ่ แดชบอร์ดจัดการร้าน</p>
                </div>
                <span className="text-3xl">🎲</span>
            </div>
        </header>
    )
}