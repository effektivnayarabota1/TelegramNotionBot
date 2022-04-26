export default async function smile() {
    const smiles = [
        '>:(',
        'O.O',
        '^o^',
        '^.^',
        '(✿◡‿◡)',
        "(>'-'<)",
        '¯\_(ツ)_/¯'
    ]
    return smiles[Math.round(Math.random() * (smiles.length - 1))]
}
