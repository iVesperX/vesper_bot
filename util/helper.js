export function clone(o) { return Object.assign({}, o) }
export function equals(v1, v2) { return v1.toLowerCase() == v2.toLowerCase() }

export function resolved(interaction) {
    return interaction.replied || interaction.deferred ? 'followUp' : 'reply'
}
