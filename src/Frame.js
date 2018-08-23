const pointDistance = function(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
};

const degreToAlpha = function(d) {
  d = ((d % 360) + 360) % 360;
  return (d / 360.0) * 2 * Math.PI;
};

const radianToDegre = function(r) {
  let d = (r * 360.0) / (2 * Math.PI);
  d = ((d % 360) + 360) % 360;
  return d;
};

const checkEquality = function(name1, value1, name2, value2, eps = 0.03) {
  if (Math.abs(value1 - value2) / Math.max(value1, value2) > eps) {
    console.log(name1 + ' = ' + value1 + ' ' + name2 + ' = ' + value2);
    return false;
  }
  return true;
};

/**
 * check if x is undefined (recommended way)
 */
const isUndefined = function(x) {
  return typeof x === 'undefined';
};

const isDefined = function(x) {
  return !isUndefined(x);
};

const float2 = function(x) {
  return Math.floor(x * 100) / 100;
};

const convertField = function(field) {
  if (field === 'None' || isUndefined(field)) {
    return undefined;
  } else {
    const v = parseFloat(field);
    if (!isNaN(v)) {
      return v;
    }
  }
  return field;
};

class Frame {
  constructor(o) {
    this._id = o._id;
    this.brand = convertField(o.brand);
    this.model = convertField(o.model);
    this.size = convertField(o.size);
    this.year = convertField(o.year);
    this.virtual_seat_tube = convertField(o.virtual_seat_tube);
    this.virtual_top_tube = convertField(o.virtual_top_tube);
    this.seat_tube = convertField(o.seat_tube);
    this.top_tube = convertField(o.top_tube);
    this.head_tube_angle = convertField(o.head_tube_angle);
    this.seat_tube_angle = convertField(o.seat_tube_angle);
    this.head_tube_length = convertField(o.head_tube_length);
    this.chain_stay_length = convertField(o.chain_stay_length);
    this.front_center = convertField(o.front_center);
    this.wheelbase = convertField(o.wheelbase);
    this.bottom_bracket_drop = convertField(o.bottom_bracket_drop);
    this.bracket_height = convertField(o.bracket_height);
    this.stack = convertField(o.stack);
    this.reach = convertField(o.reach);
    this.crank_length = convertField(o.crank_length);
    this.fork_rate = convertField(o.fork_rate);

    // console.log(this);
    if (isDefined(this.head_tube_angle)) {
      this.head_tube_angle = 180.0 - this.head_tube_angle;
    }
    if (isDefined(this.seat_tube_angle)) {
      this.seat_tube_angle = 180.0 - this.seat_tube_angle;
    }
    if (isUndefined(this.crank_length)) {
      this.crank_length = 17.25; // 172.5mm
    }

    // extra data
    this.wheel_circumference = 211.0;
    this.wheel_diameter = this.wheel_circumference / Math.PI;
    this.wheel_radius = this.wheel_diameter / 2;
    this.stem_length = 10.0;
    this.stem_angle = 80.0; // degres
    this.stem_spacer = 3.5; // total heigth of spacers
    this.stem_height = 4.5;
    this.handlebar_diameter = 2.54;
    // steer_tube_diameter

    this.o_x = 0.0;
    this.o_y = 0.0;

    this.saddleHeight = undefined;
    this.saddleForeAft = undefined;
  }

  checkEquality(name1, v1, name2, v2, threshold) {
    return Math.abs(v1 - v2) / Math.max(v1, v2) <= threshold;
  }

  geometryToString() {
    return (
      '' +
      this.brand +
      ', ' +
      // + this.model + ', ' +
      +this.size +
      ', ' +
      // + this.year + ', ' +
      // + this.virtual_seat_tube + ', ' +
      // + this.virtual_top_tube + ', ' +
      // + this.seat_tube + ', ' +
      // + this.top_tube + ', ' +
      // + 180.0 - this.head_tube_angle + ', ' +
      // + 180.0 - this.seat_tube_angle + ', ' +
      // + this.head_tube_angle + ', ' +
      // + this.chain_stay_length + ', ' +
      // + this.front_center + ', ' +
      // + this.wheelbase + ', ' +
      // + this.bottom_bracket_drop + ', ' +
      // + this.bracket_height + ', ' +
      // + this.stack + ', ' +
      // + this.reach + ', ' +
      // + this.crank_length;
      ''
    );
  }

  display() {
    console.log('%s %s size %s:', this.brand, this.model, this.size);

    console.log(
      'stack/reach = %f mean = %f stack/reach normalised = %f/10.0 ',
      float2(this.ratio_stack_reach),
      float2(this.ratio_stack_reach_moy),
      float2(this.ratio_stack_reach_normal)
    );

    console.log(
      'saddle height /ground = %f head set/ground = %f',
      float2(this.saddle_y + this.bracket_height),
      float2(this.stem_base_y + this.bracket_height)
    );

    console.log('drop = %f', float2(this.drop));

    const dsd = pointDistance(
      this.saddle_x,
      this.saddle_y,
      this.stem_base_x,
      this.stem_base_y
    );

    console.log('distance saddle-head set = %f', float2(dsd));

    console.log(
      'wheelbase = %f fork_rate = %f',
      float2(this.wheelbase),
      float2(this.fork_rate)
    );

    console.log(
      'dsd/drop = %f mean = %f dsd/drop normalised = %f/10.0 ',
      float2(this.ratio_dsd_drop),
      float2(this.ratio_dsd_drop_moy),
      float2(this.ratio_dsd_drop_normal)
    );

    console.log(
      'dsd/hs   = %f mean = %f dsd/hs   normalised = %f/10.0 ',
      float2(this.ratio_dsd_saddle_height),
      float2(this.ratio_dsd_saddle_height_moy),
      float2(this.ratio_dsd_saddle_height_normal)
    );

    const dst = this.saddle_x - this.saddle_seat_tube_x;
    if (dst >= 0) {
      console.log(
        "creux de selle avancé de %fcm par ratio à l'axe du tube de selle",
        float2(dst)
      );
    } else {
      console.log(
        "creux de selle reculé de %fcm par ratio à l'axe du tube de selle",
        float2(-dst)
      );
      console.log(
        'hauteur pedalier = %f difference pedalier - axe roue = %f',
        float2(this.bracket_height),
        float2(this.bottom_bracket_drop)
      );
    }
  }

  /**
   * compute a normal form for a bike
   * @param saddleHeight
   * @param saddleForeAft
   */
  computeGeometry(saddleHeight, saddleForeAft) {
    this.saddleHeight = saddleHeight;
    this.saddleForeAft = saddleForeAft;

    // compute bracket_height : wheel_radius = bracket_height + bottom_bracket_drop
    if (isDefined(this.bracket_height) && isDefined(this.bottom_bracket_drop)) {
      if (
        !this.checkEquality(
          'wheel diameter',
          this.wheel_diameter,
          'computed wheel diameter',
          2 * (this.bracket_height + this.bottom_bracket_drop),
          0.03
        )
      ) {
        console.log(
          'bracket_height and bottom_bracket_drop are not compatible'
        );
        console.log(this);
      }
    } else if (isDefined(this.bracket_height)) {
      this.bottom_bracket_drop = this.wheel_radius - this.bracket_height;
    } else if (isDefined(this.bottom_bracket_drop)) {
      this.bracket_height = this.wheel_radius - this.bottom_bracket_drop;
    } else {
      console.log('cannot compute geometry');
      console.log('please give at least bracket_height or bottom_bracket_drop');
    }

    // here, bracket_height, bottom_bracket_drop and wheel_radius are known

    //     center of rear wheel
    //     distance between wheel axle  - crank axle, at crank's level
    this.rear_wheel_x =
      this.o_x -
      Math.sqrt(
        this.chain_stay_length ** 2 -
          (this.wheel_radius - this.bracket_height) ** 2
      );
    this.rear_wheel_y = this.wheel_radius - this.bracket_height;

    // compute the position of the head set
    if (isDefined(this.reach) && isDefined(this.stack)) {
      // case: we know reach and stack
      // stem base
      this.stem_base_x = this.o_x + this.reach;
      this.stem_base_y = this.o_y + this.stack;

      // tube horizontal base
      this.horizontal_tube_base_x =
        this.stem_base_x - 4.25 * Math.cos(degreToAlpha(this.head_tube_angle));
      this.horizontal_tube_base_y =
        this.stem_base_y - 4.25 * Math.sin(degreToAlpha(this.head_tube_angle));

      // we deduce virtual_seat_tube and virtual_top_tube
      this.virtual_heel_height =
        (this.horizontal_tube_base_y - this.o_y) *
        Math.sin(degreToAlpha(this.seat_tube_angle));
      this.virtual_seat_tube_x =
        this.o_x +
        this.virtual_heel_height * Math.cos(degreToAlpha(this.seat_tube_angle));
      this.virtual_seat_tube_y = this.horizontal_tube_base_y;
      this.virtual_top_tube =
        this.horizontal_tube_base_x - this.virtual_seat_tube_x;

      // this.stack = this.stem_base_y - this.o_y
      // this.reach = this.stem_base_x - this.o_x
    } else if (
      isDefined(this.virtual_seat_tube) &&
      isDefined(this.virtual_top_tube)
    ) {
      // case: we know virtual_seat_tube and virtual_top_tube

      // virtual point where the tube would be really horizontal
      this.virtual_seat_tube_x =
        this.o_x +
        this.virtual_seat_tube * Math.cos(degreToAlpha(this.seat_tube_angle));
      this.virtual_seat_tube_y =
        this.o_y +
        this.virtual_seat_tube * Math.sin(degreToAlpha(this.seat_tube_angle));

      //  horizontal tube base
      this.horizontal_tube_base_x =
        this.virtual_seat_tube_x + this.virtual_top_tube;
      this.horizontal_tube_base_y = this.virtual_seat_tube_y;

      // stem base
      this.stem_base_x =
        this.horizontal_tube_base_x +
        3.77 * Math.cos(degreToAlpha(this.head_tube_angle));
      this.stem_base_y =
        this.horizontal_tube_base_y +
        3.77 * Math.sin(degreToAlpha(this.head_tube_angle));

      // we deduce stack and reach
      this.stack = this.stem_base_y - this.o_y;
      this.reach = this.stem_base_x - this.o_x;

      // console.log("BTHy = %.2f stem_base_y = %.2f stack = %.2f" % (this.horizontal_tube_base_y, this.stem_base_y, this.stack))
    } else {
      console.log('cannot compute head set position');
      console.log(
        'please give reach/stack or horizontal tube length and virtual seat tube height'
      );
    }

    // fork base
    this.fork_base_x =
      this.stem_base_x -
      this.head_tube_length * Math.cos(degreToAlpha(this.head_tube_angle));
    this.fork_base_y =
      this.stem_base_y -
      this.head_tube_length * Math.sin(degreToAlpha(this.head_tube_angle));
    // compute wheelbase: front_center**2 = bottom_bracket_drop**2 + ( wheelbase - chain_stay_length*cos(asin(bottom_bracket_drop/chain_stay_length)) )**2
    if (isDefined(this.wheelbase) && isDefined(this.front_center)) {
      const computedWheelbase =
        Math.sqrt(this.front_center ** 2 - this.bottom_bracket_drop ** 2) +
        this.chain_stay_length *
          Math.cos(
            Math.asin(this.bottom_bracket_drop / this.chain_stay_length)
          );
      if (
        !this.checkEquality(
          'wheelbase',
          this.wheelbase,
          'computed_wheelbase',
          computedWheelbase,
          0.01
        )
      ) {
        console.log('front center and wheelbase are not compatible');
      }
    } else if (isDefined(this.front_center)) {
      this.wheelbase =
        Math.sqrt(this.front_center ** 2 - this.bottom_bracket_drop ** 2) +
        this.chain_stay_length *
          Math.cos(
            Math.asin(this.bottom_bracket_drop / this.chain_stay_length)
          );
    } else if (isDefined(this.wheelbase)) {
      this.front_center = Math.sqrt(
        this.bottom_bracket_drop ** 2 +
          (this.wheelbase -
            this.chain_stay_length *
              Math.cos(
                Math.asin(this.bottom_bracket_drop / this.chain_stay_length)
              )) **
            2
      );
    } else if (isDefined(this.fork_rate)) {
      /*
            Equations
            virtual_front_wheel_x = BFx - l * Math.cos(degre_to_alpha(head_tube_angle))
            virtual_front_wheel_y = BFy - l * Math.sin(degre_to_alpha(head_tube_angle))
            virtual_front_wheel_y === rr - bracket_height
            virtual_front_wheel_x + this.fork_rate = RAVx
            */

      let virtualFrontWheelY = this.wheel_radius - this.bracket_height;
      let l =
        -(virtualFrontWheelY - this.fork_base_y) /
        Math.sin(degreToAlpha(this.head_tube_angle));
      let virtualFrontWheelX =
        this.fork_base_x - l * Math.cos(degreToAlpha(this.head_tube_angle));
      this.front_wheel_x = virtualFrontWheelX + this.fork_rate;
      this.front_wheel_y = virtualFrontWheelY;
      this.wheelbase = this.front_wheel_x - this.rear_wheel_x;
      this.front_center = Math.sqrt(
        this.bottom_bracket_drop ** 2 +
          (this.wheelbase -
            this.chain_stay_length *
              Math.cos(
                Math.asin(this.bottom_bracket_drop / this.chain_stay_length)
              )) **
            2
      );
    } else {
      console.log('cannot compute geometry');
      console.log(
        'please give at least wheelbase, front base length or fork rate'
      );
      console.log(this.geometryToString());
    }

    // centre roue avant
    // distance axe roue - axe pédalier au niveau du pedalier
    this.front_wheel_x =
      this.o_x +
      Math.sqrt(
        this.front_center ** 2 - (this.wheel_radius - this.bracket_height) ** 2
      );
    this.front_wheel_y = this.wheel_radius - this.bracket_height;

    // console.log("axe roue arriere = (%.2f, %.2f) axe roue avant = (%.2f, %.2f)" % (this.rear_wheel_x, this.rear_wheel_y, this.front_wheel_x, this.front_wheel_y))

    if (isUndefined(this.fork_rate)) {
      // virtual_front_wheel
      // equation: this.front_wheel_y = this.fork_base_y - l * Math.sin(degre_to_alpha(this.head_tube_angle))
      let l =
        -(this.front_wheel_y - this.fork_base_y) /
        Math.sin(degreToAlpha(this.head_tube_angle));
      let virtualFrontWheelX =
        this.fork_base_x - l * Math.cos(degreToAlpha(this.head_tube_angle));
      this.fork_rate = this.front_wheel_x - virtualFrontWheelX;
    }

    if (isDefined(this.seat_tube)) {
      // tube de selle - jusqu'au tube horizontal (peut etre slooping)
      this.seat_tube_x =
        this.o_x +
        this.seat_tube * Math.cos(degreToAlpha(this.seat_tube_angle));
      this.seat_tube_y =
        this.o_y +
        this.seat_tube * Math.sin(degreToAlpha(this.seat_tube_angle));
    } else {
      this.seat_tube_x = undefined;
      this.seat_tube_y = undefined;
    }

    // down tube base
    this.down_tube_x =
      this.fork_base_x + 4.25 * Math.cos(degreToAlpha(this.head_tube_angle));
    this.down_tube_y =
      this.fork_base_y + 4.25 * Math.sin(degreToAlpha(this.head_tube_angle));

    // saddle
    this.saddle_x = this.o_x - this.saddleForeAft;
    this.saddle_y =
      this.o_y +
      this.saddleHeight * Math.sin(degreToAlpha(this.seat_tube_angle));
    this.saddle_seat_tube_x =
      this.o_x +
      this.saddleHeight * Math.cos(degreToAlpha(this.seat_tube_angle)); // abscisse du tube de selle au niveau de la selle

    // difference saddle - stem base
    this.drop = this.saddle_y - this.stem_base_y;

    // pedal axle
    let alpha = 0.0;
    this.pedal_x = this.o_x + this.crank_length * Math.cos(alpha);
    this.pedal_y = this.o_y + this.crank_length * Math.sin(alpha);

    // calcul d'indicateurs
    this.saddle_stem_distance = pointDistance(
      this.saddle_x,
      this.saddle_y,
      this.stem_base_x,
      this.stem_base_y
    );
    this.ratio_saddle_stem_distance_drop =
      this.saddle_stem_distance / this.drop;
    this.ratio_saddle_stem_distance_saddle_height =
      this.saddle_stem_distance / this.saddleHeight;
    this.ratio_stack_reach = this.stack / this.reach;
  }

  distance(other, dsd = '', drop = '', ratioDsdDrop = '', deport = undefined) {
    let res = 0.0;
    const dsd1 = pointDistance(
      this.saddle_x,
      this.saddle_y,
      this.stem_base_x,
      this.stem_base_y
    );
    const dsd2 = pointDistance(
      other.saddle_x,
      other.saddle_y,
      other.stem_base_x,
      other.stem_base_y
    );

    const deltaDsd = dsd2 - dsd1;
    const deltaDrop = other.drop - this.drop;
    const deltaRatioDsdDrop = dsd2 / other.drop - dsd1 / this.drop;
    const deltaDeport = other.fork_rate - this.fork_rate;

    const args = [dsd, drop, ratioDsdDrop, deport];
    const deltas = [deltaDsd, deltaDrop, deltaRatioDsdDrop, deltaDeport];

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
    return res;
  }
}

export default Frame;
