// @flow
import * as React from 'react';

type Props = {
  bike: { brand: string, model: string, size: string | number, year: number },
  distance: number,
};

const Bike = ({ bike: { brand, model, size, year }, distance }: Props) => (
  <li>
    {brand} {model} Size {size} {year ? ' (' + year + ')' : ''}{' '}
    {(distance || distance === 0) &&
      ' Score: ' + Math.floor(100 * (1 - distance)) + '%'}
  </li>
);

export default Bike;
