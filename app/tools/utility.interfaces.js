/**
 * Recursively makes all properties of an object type optional.
 * @template T
 * @typedef {T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T} DeepPartial
 */
/**
 * Converts a union type to an object type with the union members as keys and their index as values.
 * @template T
 * @typedef {Object.<T, number>} UnionToObject
 */
