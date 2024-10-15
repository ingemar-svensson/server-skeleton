import * as randomstring from 'randomstring';

export const randomCode = (length?: number) => {
  const random = randomstring.generate({
    length: length || 6,
    charset: 'numeric', 
  })
  return random;
};

export const propertyReference = () => {
  const reference = randomstring.generate({
    length: 8,
    charset: 'alphanumeric', 
  })
  return 'poco-' + reference;
};
