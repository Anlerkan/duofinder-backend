/**
 * Omits provided fields from main object
 * @param obj Target object
 * @param keys Keys to omit from obj
 */
function omitKeys<T extends { [x: string]: any }, K extends keyof T>(obj: T, ...keys: K[]) {
  const newObj: { [x: string]: any } = {};

  Object.keys(obj).forEach((key) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore 'string' is assignable to the constraint of type 'K', but 'K' could be instantiated with a different subtype of constraint 'string | number | symbol'.
    // couldn't solve this issue
    if (!keys.includes(key)) {
      newObj[key as string] = obj[key];
    }
  });

  return newObj as Omit<T, K>;
}

/**
 * Picks provided fields from main object and returns new object which includes picked values
 * @param obj Target object
 * @param keys Keys to select from obj
 */
function pickKeys<T extends { [x: string]: any }, K extends keyof T>(obj: T, ...keys: K[]) {
  const newObj: { [x: string]: any } = {};

  keys.forEach((key) => {
    newObj[key as string] = obj[key];
  });

  return newObj as Omit<T, Exclude<keyof T, K>>;
}

export { omitKeys, pickKeys };
