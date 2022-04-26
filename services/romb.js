export default async function romb() {
    const rombies = '◇▽○◦◯◌◊'
    return rombies[Math.round(Math.random() * (rombies.length - 1))]
}
