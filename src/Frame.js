// @flow
/* eslint camelcase: ["error", {properties: "never"}] */

import { pointDistance, degreToAlpha, float2 } from './Tools';

/**
 * check if x is undefined (recommended way)
 */
const isUndefined = function(x) {
  return typeof x === 'undefined' || x === null;
};

const convertFieldToNumber = function(field: string): number | void {
  if (field === 'None' || isUndefined(field)) {
    return undefined;
  }
  const v = parseFloat(field);
  if (!isNaN(v)) {
    return v;
  }

  return undefined;
};

const checkEquality = function(
  name1: string,
  v1: number,
  name2: string,
  v2: number,
  threshold: number
): boolean {
  return Math.abs(v1 - v2) / Math.max(v1, v2) <= threshold;
};

const getBracketHeightAndBottomBracketDrop = function(
  bracketHeight: ?number,
  bottomBracketDrop: ?number,
  wheelRadius: number
): { bracketHeight: number, bottomBracketDrop: number } {
  if (
    typeof bracketHeight === 'number' &&
    typeof bottomBracketDrop === 'number'
  ) {
    return {
      bracketHeight,
      bottomBracketDrop,
    };
  }
  if (typeof bracketHeight === 'number') {
    return {
      bracketHeight,
      bottomBracketDrop: wheelRadius - bracketHeight,
    };
  }
  if (typeof bottomBracketDrop === 'number') {
    return {
      bracketHeight: wheelRadius - bottomBracketDrop,
      bottomBracketDrop,
    };
  }
  return { bracketHeight: 0, bottomBracketDrop: 0 }; // should never occur
};

const getWheelBaseAndFrontCenter = function(
  wheelbase: ?number,
  frontCenter: ?number,
  forkRate: ?number,
  chainStayLength: number,
  bottomBracketDrop: number,
  bracketHeight: number,
  wheelRadius: number,
  headTubeAngle: number,
  forkBaseX: number,
  forkBaseY: number,
  rearWheelX: number
): { wheelbase: number, frontCenter: number } {
  // compute wheelbase: frontcenter**2 = bottomBracketDrop**2 +
  // ( wheelbase - chainStayLength*cos(asin(bottomBracketDropChainStayLength)) )**2
  if (typeof wheelbase === 'number' && typeof frontCenter === 'number') {
    return { wheelbase, frontCenter };
  }
  if (typeof frontCenter === 'number') {
    return {
      wheelbase:
        Math.sqrt(frontCenter ** 2 - bottomBracketDrop ** 2) +
        chainStayLength *
          Math.cos(Math.asin(bottomBracketDrop / chainStayLength)),
      frontCenter,
    };
  }
  if (typeof wheelbase === 'number') {
    return {
      wheelbase,
      frontCenter: Math.sqrt(
        bottomBracketDrop ** 2 +
          (wheelbase -
            chainStayLength *
              Math.cos(Math.asin(bottomBracketDrop / chainStayLength))) **
            2
      ),
    };
  }
  if (typeof forkRate === 'number') {
    /*
        Equations
        virtualFrontWheelX = forkBaseX - l * Math.cos(degreToAlpha(headTubeAngle))
        virtualFrontWheelY = forkBaseY - l * Math.sin(degreToAlpha(headTubeAngle))
        virtualFrontWheelY === wheelRadius - bracketHeight
        virtualFrontWheelX + forkRate = frontWheelX
        */

    const virtualFrontWheelY = wheelRadius - bracketHeight;
    const l =
      -(virtualFrontWheelY - forkBaseY) / Math.sin(degreToAlpha(headTubeAngle));
    const virtualFrontWheelX =
      forkBaseX - l * Math.cos(degreToAlpha(headTubeAngle));
    const frontWheelX = virtualFrontWheelX + forkRate;
    const frontWheelY = virtualFrontWheelY;
    const wb = frontWheelX - rearWheelX;
    return {
      wheelbase: wb,
      frontCenter: Math.sqrt(
        bottomBracketDrop ** 2 +
          (wb -
            chainStayLength *
              Math.cos(Math.asin(bottomBracketDrop / chainStayLength))) **
            2
      ),
    };
  }
  return { wheelbase: 0, frontCenter: 0 }; // should never occur
};

type oType = {
  _id: string,
  brand: string,
  model: string,
  size: string,
  year: string,
  virtualSeatTube: string,
  virtualTopTube: string,
  seatTube: string,
  topTube: string,
  headTubeAngle: string,
  seatTubeAngle: string,
  headTubeLength: string,
  chainStayLength: string,
  frontCenter: string,
  wheelbase: string,
  bottomBracketDrop: string,
  bracketHeight: string,
  stack: string,
  reach: string,
  crankLength: string,
  forkRate: string,
};

/**
 * compute a normal form for a bike
 */
const computeGeometry = function(
  o: oType
): {
  bracketHeight: number,
  bottomBracketDrop: number,
  virtualTopTube: number,
  stemBaseX: number,
  stemBaseY: number,
  stack: number,
  reach: number,
  wheelbase: number,
  frontCenter: number,
  forkRate: number,
  crankLength: number,
} {
  const virtualSeatTube = convertFieldToNumber(o.virtualSeatTube);
  let virtualTopTube = convertFieldToNumber(o.virtualTopTube);
  const seatTube = convertFieldToNumber(o.seatTube);
  const topTube = convertFieldToNumber(o.topTube);
  const headTubeAngle = 180.0 - parseFloat(o.headTubeAngle);
  const seatTubeAngle = 180.0 - parseFloat(o.seatTubeAngle);
  const headTubeLength = parseFloat(o.headTubeLength);
  const chainStayLength = parseFloat(o.chainStayLength);
  let frontCenter = convertFieldToNumber(o.frontCenter);
  let wheelbase = convertFieldToNumber(o.wheelbase);
  let bottomBracketDrop = convertFieldToNumber(o.bottomBracketDrop);
  // console.log(
  //   `o.bottomBracketDrop = ${
  //     o.bottomBracketDrop
  //   }, bottomBracketDrop = ${bottomBracketDrop}`
  // );
  let bracketHeight = convertFieldToNumber(o.bracketHeight);
  let stack = convertFieldToNumber(o.stack);
  let reach = convertFieldToNumber(o.reach);
  const crankLength =
    isUndefined(o.crankLength) || o.crankLength === 'None'
      ? 17.25 /* 172.5mm */
      : parseFloat(o.crankLength);
  let forkRate = convertFieldToNumber(o.forkRate);

  // extra data
  const wheelCircumference = 211.0;
  const wheelDiameter = wheelCircumference / Math.PI;
  const wheelRadius = wheelDiameter / 2;
  const stemLength = 10.0;
  const stemAngle = 80.0; // degres
  const stemSpacer = 3.5; // total heigth of spacers
  const stemHeight = 4.5;
  const handlebarDiameter = 2.54;

  const oX = 0.0;
  const oY = 0.0;

  // console.log(
  //   `bracketHeight = ${bracketHeight}, bottomBracketDrop = ${bottomBracketDrop}`
  // );
  if (
    typeof bracketHeight === 'number' ||
    typeof bottomBracketDrop === 'number'
  ) {
    /** compute
     * bracketHeight : wheelRadius = bracketHeight + bottomBracketDrop
     * bottomBracketDrop
     */
    ({
      bracketHeight,
      bottomBracketDrop,
    } = getBracketHeightAndBottomBracketDrop(
      bracketHeight,
      bottomBracketDrop,
      wheelRadius
    ));

    // update geometry
    // this.bracketHeight = bracketHeight;
    // this.bottomBracketDrop = bottomBracketDrop;

    if (
      !checkEquality(
        'wheel diameter',
        wheelDiameter,
        'computed wheel diameter',
        2 * (bracketHeight + bottomBracketDrop),
        0.03
      )
    ) {
      console.log(
        'Warning: bracketHeight and bottomBracketDrop are not compatible'
      );
      console.log(o);
    }

    if (typeof reach === 'number' && typeof stack === 'number') {
      /** compute
       * reach
       * stack
       * virtualTopTube
       * stemBaseX
       * stemBaseY
       */

      // case: we know reach and stack

      // stem base
      const stemBaseX = oX + reach;
      const stemBaseY = oY + stack;

      // tube horizontal base
      const horizontalTubeBaseX: number =
        stemBaseX - 4.25 * Math.cos(degreToAlpha(headTubeAngle));
      const horizontalTubeBaseY: number =
        stemBaseY - 4.25 * Math.sin(degreToAlpha(headTubeAngle));

      // we deduce virtualSeatTube and virtualTopTube
      const virtualHeelHeight =
        (horizontalTubeBaseY - oY) * Math.sin(degreToAlpha(seatTubeAngle));

      const virtualSeatTubeX =
        oX + virtualHeelHeight * Math.cos(degreToAlpha(seatTubeAngle));
      const virtualSeatTubeY = horizontalTubeBaseY;
      virtualTopTube = horizontalTubeBaseX - virtualSeatTubeX;

      // stack = stemBaseY - oY
      // reach = stemBaseX - oX

      // update geometry
      // this.virtualTopTube = virtualTopTube;
      // this.stemBaseX = stemBaseX;
      // this.stemBaseY = stemBaseY;
    } else if (
      typeof virtualSeatTube === 'number' &&
      typeof virtualTopTube === 'number'
    ) {
      // case: we know virtualSeatTube and virtualTopTube

      // virtual point where the tube would be really horizontal
      const virtualSeatTubeX =
        oX + virtualSeatTube * Math.cos(degreToAlpha(seatTubeAngle));
      const virtualSeatTubeY =
        oY + virtualSeatTube * Math.sin(degreToAlpha(seatTubeAngle));

      //  horizontal tube base
      const horizontalTubeBaseX = virtualSeatTubeX + virtualTopTube;
      const horizontalTubeBaseY = virtualSeatTubeY;

      // stem base
      const stemBaseX =
        horizontalTubeBaseX + 3.77 * Math.cos(degreToAlpha(headTubeAngle));
      const stemBaseY =
        horizontalTubeBaseY + 3.77 * Math.sin(degreToAlpha(headTubeAngle));

      // we deduce stack and reach
      stack = stemBaseY - oY;
      reach = stemBaseX - oX;

      // update geometry
      // this.stack = stack;
      // this.reach = reach;
      // this.stemBaseX = stemBaseX;
      // this.stemBaseY = stemBaseY;

      // console.log("BTHy = %.2f stemBaseY = %.2f stack = %.2f" %
      // (horizontalTubeBaseY, stemBaseY, stack))

      const rearWheelX =
        oX -
        Math.sqrt(chainStayLength ** 2 - (wheelRadius - bracketHeight) ** 2);
      const rearWheelY = wheelRadius - bracketHeight;

      // update geometry

      // here, bracketHeight, bottomBracketDrop and wheelRadius are known

      //     center of rear wheel
      //     distance between wheel axle  - crank axle, at crank's level

      // compute the position of the head set

      // fork base
      const forkBaseX =
        stemBaseX - headTubeLength * Math.cos(degreToAlpha(headTubeAngle));
      const forkBaseY =
        stemBaseY - headTubeLength * Math.sin(degreToAlpha(headTubeAngle));

      ({ wheelbase, frontCenter } = getWheelBaseAndFrontCenter(
        wheelbase,
        frontCenter,
        forkRate,
        chainStayLength,
        bottomBracketDrop,
        bracketHeight,
        wheelRadius,
        headTubeAngle,
        forkBaseX,
        forkBaseY,
        rearWheelX
      ));

      if (wheelbase === 0 && frontCenter === 0) {
        console.log('cannot compute geometry');
        console.log(
          'please give at least wheelbase, front base length or fork rate'
        );
      }

      const computedWheelbase =
        Math.sqrt(frontCenter ** 2 - bottomBracketDrop ** 2) +
        chainStayLength *
          Math.cos(Math.asin(bottomBracketDrop / chainStayLength));
      if (
        !checkEquality(
          'wheelbase',
          wheelbase,
          'computedWheelbase',
          computedWheelbase,
          0.01
        )
      ) {
        console.log('front center and wheelbase are not compatible');
      }

      // update geometry
      // this.wheelbase = wheelbase;
      // this.frontcenter = frontCenter;

      // centre roue avant
      // distance axe roue - axe pédalier au niveau du pedalier
      const frontWheelX =
        oX + Math.sqrt(frontCenter ** 2 - (wheelRadius - bracketHeight) ** 2);
      const frontWheelY = wheelRadius - bracketHeight;

      // console.log("axe roue arriere = (%.2f, %.2f) axe roue avant = (%.2f, %.2f)" %
      // (rearWheelX, rearWheelY, frontWheelX, frontWheelY))

      if (typeof forkRate !== 'number') {
        // virtualFrontWheel
        // equation: frontWheelY = forkBaseY - l * Math.sin(degreToAlpha(headTubeAngle))
        const l =
          -(frontWheelY - forkBaseY) / Math.sin(degreToAlpha(headTubeAngle));
        const virtualFrontWheelX =
          forkBaseX - l * Math.cos(degreToAlpha(headTubeAngle));
        forkRate = frontWheelX - virtualFrontWheelX;
        // update geometry
        // this.forkRate = forkRate;
      }

      if (typeof seatTube === 'number') {
        // tube de selle - jusqu'au tube horizontal (peut etre slooping)
        const seatTubeX = oX + seatTube * Math.cos(degreToAlpha(seatTubeAngle));
        const seatTubeY = oY + seatTube * Math.sin(degreToAlpha(seatTubeAngle));
      } else {
        const seatTubeX = undefined;
        const seatTubeY = undefined;
      }

      // down tube base
      const downTubeX =
        forkBaseX + 4.25 * Math.cos(degreToAlpha(headTubeAngle));
      const downTubeY =
        forkBaseY + 4.25 * Math.sin(degreToAlpha(headTubeAngle));

      // pedal axle
      const alpha = 0.0;
      const pedalX = oX + crankLength * Math.cos(alpha);
      const pedalY = oY + crankLength * Math.sin(alpha);

      return {
        bracketHeight,
        bottomBracketDrop,
        virtualTopTube,
        stemBaseX,
        stemBaseY,
        stack,
        reach,
        wheelbase,
        frontCenter,
        forkRate,
        crankLength,
      };
    } else {
      console.log('cannot compute head set position');
      console.log(
        'please give reach/stack or horizontal tube length and virtual seat tube height'
      );
    }
  } else {
    // bracketHeight && bottomBracketDrop are not defined
    console.log('cannot compute geometry');
    console.log('please give at least bracketHeight or bottomBracketDrop');
    // this.bracketHeight = 0;
  }
  return {
    bracketHeight: 0.0,
    bottomBracketDrop: 0.0,
    virtualTopTube: 0.0,
    stemBaseX: 0.0,
    stemBaseY: 0.0,
    stack: 0.0,
    reach: 0.0,
    wheelbase: 0.0,
    frontCenter: 0.0,
    forkRate: 0.0,
    crankLength: 0.0,
  };
};

class Frame {
  _id: string;

  brand: string;

  model: string;

  size: string;

  year: ?number;

  virtualSeatTube: number;

  virtualTopTube: number;

  seatTube: number;

  topTube: number;

  headTubeAngle: number;

  seatTubeAngle: number;

  headTubeLength: number;

  chainStayLength: number;

  frontCenter: number;

  wheelbase: number;

  bottomBracketDrop: number;

  bracketHeight: number;

  stack: number;

  reach: number;

  crankLength: number;

  forkRate: number;

  wheelCircumference: number;

  wheelDiameter: number;

  wheelRadius: number;

  stemLength: number;

  stemAngle: number;

  stemSpacer: number;

  stemHeight: number;

  handlebarDiameter: number;

  oX: number;

  oY: number;

  // set by computeGeometry
  // rearWheelX: number;
  stemBaseX: number;

  stemBaseY: number;

  saddleX: number;

  saddleY: number;

  saddleSeatTubeX: number;

  drop: number;

  saddleStemDistance: number;

  constructor(o: oType) {
    // console.log(`constructor o = ${o}`);
    // console.log(o);
    const g = computeGeometry(o);
    // console.log(`g.bottomBracketDrop = ${g.bottomBracketDrop}`);

    this._id = o._id;
    this.brand = o.brand;
    this.model = o.model;
    this.size = o.size;
    this.year = convertFieldToNumber(o.year);

    this.headTubeAngle = parseFloat(o.headTubeAngle);
    this.seatTubeAngle = parseFloat(o.seatTubeAngle);
    this.headTubeLength = parseFloat(o.headTubeLength);
    this.chainStayLength = parseFloat(o.chainStayLength);

    this.bottomBracketDrop = g.bottomBracketDrop;
    this.bracketHeight = g.bracketHeight;
    this.virtualTopTube = g.virtualTopTube;
    this.stemBaseX = g.stemBaseX;
    this.stemBaseY = g.stemBaseY;
    this.stack = g.stack;
    this.reach = g.reach;
    this.wheelbase = g.wheelbase;
    this.frontCenter = g.frontCenter;
    this.forkRate = g.forkRate;
    this.crankLength = g.crankLength;

    // // extra data
    // this.wheelCircumference = 211.0;
    // this.wheelDiameter = this.wheelcircumference / Math.PI;
    // this.wheelRadius = this.wheelDiameter / 2;
    // this.stemLength = 10.0;
    // this.stemAngle = 80.0; // degres
    // this.stemSpacer = 3.5; // total heigth of spacers
    // this.stemHeight = 4.5;
    // this.handlebarDiameter = 2.54;

    // this.oX = 0.0;
    // this.oY = 0.0;
  }

  /**
   *
   */
  getSaddleAndDrop(
    saddleHeight: number,
    saddleForeAft: number
  ): { saddleX: number, saddleY: number, drop: number } {
    const { oX, oY, seatTubeAngle, stemBaseY } = this;
    // saddle
    const saddleX = oX - saddleForeAft;
    const saddleY = oY + saddleHeight * Math.sin(degreToAlpha(seatTubeAngle));
    // abscisse du tube de selle au niveau de la selle

    const saddleSeatTubeX =
      oX + saddleHeight * Math.cos(degreToAlpha(seatTubeAngle));

    // difference saddle - stem base
    const drop = saddleY - stemBaseY;
    return { saddleX, saddleY, drop };
  }

  /**
   *
   * @param {*} other
   * @param {*} dsd
   * @param {*} drop
   * @param {*} ratioDsdDrop
   * @param {*} deport
   */
  distance(
    other: Frame,
    dsd: string = '',
    drop: string = '',
    ratioDsdDrop: string = '',
    deport: ?number = undefined
  ): number {
    let res = 0.0;
    const dsd1 = pointDistance(
      this.saddleX,
      this.saddleY,
      this.stemBaseX,
      this.stemBaseY
    );
    const dsd2 = pointDistance(
      other.saddleX,
      other.saddleY,
      other.stemBaseX,
      other.stemBaseY
    );

    const deltaDsd = dsd2 - dsd1;
    const deltaDrop = other.drop - this.drop;
    const deltaRatioDsdDrop = dsd2 / other.drop - dsd1 / this.drop;
    const deltaDeport = other.forkRate - this.forkRate;

    const args = [dsd, drop, ratioDsdDrop, deport];
    const deltas = [deltaDsd, deltaDrop, deltaRatioDsdDrop, deltaDeport];
    console.log('distance this = ');
    console.log(this);
    console.log(`distance deltas = ${deltas}`);

    const max = 1000.0;
    const cst = 100;
    const len = args.length;
    for (let i = 0; i < len; i++) {
      if (isUndefined(args[i])) {
        // do nothing
      } else if (args[i] === '') {
        res += cst * deltas[i] ** 2;
      } else if (args[i] === '+') {
        if (deltas[i] >= 0.0) {
          res += cst * deltas[i] ** 2;
        } else {
          res = max;
        }
      } else if (args[i] === '-') {
        if (deltas[i] <= 0.0) {
          res += cst * deltas[i] ** 2;
        } else {
          res = max;
        }
      } else if (args[i] === '=') {
        if (deltas[i] !== 0.0) {
          res += cst * deltas[i] ** 2;
        } else {
          res = max;
        }
      }
    }
    // return Math.sqrt(res);
    console.log(`distance res = ${res}`);

    return res;
  }

  /**
   *
   */
  geometryToString() {
    return `${this.brand}, ${this.size}, `;
  }

  /**
   * compute indocators
   */
  computeIndicator(saddleHeight: number) {
    const {
      saddleX,
      saddleY,
      stemBaseX,
      stemBaseY,
      // saddleStemDistance,
      drop,
      // saddleHeight,
      stack,
      reach,
    } = this;

    const ratioStackReach = stack / reach;
    const saddleStemDistance = pointDistance(
      saddleX,
      saddleY,
      stemBaseX,
      stemBaseY
    );

    return { ratioStackReach };
  }

  /**
   *
   */
  display(saddleHeight: number) {
    // calcul d'indicateurs
    const { ratioStackReach } = this.computeIndicator(saddleHeight);

    // const ratioSaddleStemDistanceDrop = saddleStemDistance / drop;
    // const ratioSaddleStemDistanceSaddleHeight =
    //   saddleStemDistance / saddleHeight;
    // const ratioStackReach = stack / reach;

    // console.log('%s %s size %s:', this.brand, this.model, this.size);

    // console.log(
    //   'stack/reach = %f mean = %f stack/reach normalised = %f/10.0 ',
    //   float2(ratioStackReach),
    //   float2(ratioStackReachMoy),
    //   float2(ratioStackReachNormal)
    // );

    // console.log(
    //   'saddle height /ground = %f head set/ground = %f',
    //   float2(this.saddleY + this.bracketHeight),
    //   float2(this.stemBaseY + this.bracketHeight)
    // );

    // console.log('drop = %f', float2(this.drop));

    // const dsd = pointDistance(
    //   this.saddleX,
    //   this.saddleY,
    //   this.stemBaseX,
    //   this.stemBaseY
    // );

    // console.log('distance saddle-head set = %f', float2(dsd));

    // console.log(
    //   'wheelbase = %f forkRate = %f',
    //   float2(this.wheelbase),
    //   float2(this.forkRate)
    // );

    // console.log(
    //   'dsd/drop = %f mean = %f dsd/drop normalised = %f/10.0 ',
    //   float2(this.ratioDsdDrop),
    //   float2(this.ratioDsdDropMoy),
    //   float2(this.ratioDsdDropNormal)
    // );

    // console.log(
    //   'dsd/hs   = %f mean = %f dsd/hs   normalised = %f/10.0 ',
    //   float2(this.ratioDsdSaddleHeight),
    //   float2(this.ratioDsdSaddleHeightMoy),
    //   float2(this.ratioDsdSaddleHeightNormal)
    // );

    // const dst = this.saddleX - this.saddleSeatTubeX;
    // if (dst >= 0) {
    //   console.log(
    //     "creux de selle avancé de %fcm par ratio à l'axe du tube de selle",
    //     float2(dst)
    //   );
    // } else {
    //   console.log(
    //     "creux de selle reculé de %fcm par ratio à l'axe du tube de selle",
    //     float2(-dst)
    //   );
    //   console.log(
    //     'hauteur pedalier = %f difference pedalier - axe roue = %f',
    //     float2(this.bracketHeight),
    //     float2(this.bottomBracketDrop)
    //   );
    // }
  }
}

export default Frame;
