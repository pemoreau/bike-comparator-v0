import Frame from './Frame';

class FrameDB {
  // constructor(o) {
  //   this.data = [];
  //   this.tree = {};
  //   // tree has the following form:
  //   // tree: {
  //   //     'Time': { 'NXR': { 'XS': {'2011':id1, '2010':id2},
  //   //                        'S': {'2011':id3} },
  //   //               'Skylon': { 'XS': {2015:id4},
  //   //                           'S': {2015:id5} },
  //   //     },
  //   // },
  //   this.frameList = [];
  // }

  // use class property feature
  data = [];
  frameList = [];
  tree = {};
  // tree has the following form:
  // tree: {
  //     'Time': { 'NXR': { 'XS': {'2011':id1, '2010':id2},
  //                        'S': {'2011':id3} },
  //               'Skylon': { 'XS': {2015:id4},
  //                           'S': {2015:id5} },
  //     },
  // },

  /**
   * retrieve all frame geometry from the database
   * store everything (raw information) in data
   * then, for each frame, a specific geometry is computed (using saddle_height and saddle_fore_aft)
   * those instantiated frames contains normalized information and are stored in frameList
   * discrimination tree is also initialized
   */
  populate = () => {
    // note: use this way of defining functions to auto-bing this
    const targetUrl = 'http://localhost:8080/all';
    const headers = new Headers();
    const options = {
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'default',
    };

    fetch(targetUrl, options)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Something went wrong ...');
        }
      })
      .then(data => {
        this.data = data;
      })
      .then(() => {
        this.initTree();
        const saddle_height = 74.5;
        const saddle_fore_aft = 20.5;
        this.computeFrameList(saddle_height, saddle_fore_aft);
      })
      .catch(error => console.log('Request failed', error));
  };

  /**
   * create the discrimination tree using data
   */
  initTree = () => {
    for (var elem of this.data) {
      const { brand, model, size, year, _id } = elem;
      if (!this.tree[brand]) {
        this.tree[brand] = {};
      }
      if (!this.tree[brand][model]) {
        this.tree[brand][model] = {};
      }
      if (!this.tree[brand][model][size]) {
        this.tree[brand][model][size] = {};
      }
      if (!this.tree[brand][model][size][year]) {
        this.tree[brand][model][size][year] = _id;
      }
      // console.log(brand,model,size,year,_id);
    }
    // console.log(this.tree['Time']);
  };

  /**
   * use discrimination tree to efficiently returns
   * list of brands, models, sizes, years or id
   * @returns {string[]}
   */
  getBrands = () => {
    return Object.keys(this.tree);
  };
  getModels = selectedBrand => {
    return Object.keys(this.tree[selectedBrand]);
  };
  getSizes = (selectedBrand, selectedModel) => {
    return Object.keys(this.tree[selectedBrand][selectedModel]);
  };
  getYears = (selectedBrand, selectedModel, selectedSize) => {
    return Object.keys(this.tree[selectedBrand][selectedModel][selectedSize]);
  };
  getId = (selectedBrand, selectedModel, selectedSize, selectedYear) => {
    return this.tree[selectedBrand][selectedModel][selectedSize][selectedYear];
  };

  /**
   * given selected brand, model, size and year
   * return corresponding Frame object of  frameList
   */
  getFrame = (selectedBrand, selectedModel, selectedSize, selectedYear) => {
    const selectedId = this.getId(
      selectedBrand,
      selectedModel,
      selectedSize,
      selectedYear
    );

    return this.frameList.find(f => f._id === selectedId);
  };

  /**
   * for a given saddle_height and saddle_fore_aft
   * compute once the geometry of each frame of the database
   */
  computeFrameList = (saddle_height, saddle_fore_aft) => {
    for (const f of this.data) {
      const frame = new Frame(f);
      this.frameList.push(frame);
    }
    console.log('number of bikes in frameList: ' + this.frameList.length);

    // compute extra information
    let min_ratio_stack_reach = 10.0;
    let min_ratio_dsd_drop = 10.0;
    let min_ratio_dsd_saddle_height = 10.0;
    let max_ratio_stack_reach = 0.0;
    let max_ratio_dsd_drop = 0.0;
    let max_ratio_dsd_saddle_height = 0.0;
    let sum_ratio_stack_reach = 0.0;
    let sum_ratio_dsd_drop = 0.0;
    let sum_ratio_dsd_saddle_height = 0.0;
    for (const frame of this.frameList) {
      // print(frame.geometrie_to_string())
      frame.computeGeometry(saddle_height, saddle_fore_aft);

      sum_ratio_stack_reach += frame.ratio_stack_reach;
      if (frame.ratio_stack_reach > max_ratio_stack_reach) {
        max_ratio_stack_reach = frame.ratio_stack_reach;
      } else if (frame.ratio_stack_reach < min_ratio_stack_reach) {
        min_ratio_stack_reach = frame.ratio_stack_reach;
      }

      sum_ratio_dsd_drop += frame.ratio_dsd_drop;
      if (frame.ratio_dsd_drop > max_ratio_dsd_drop) {
        max_ratio_dsd_drop = frame.ratio_dsd_drop;
      } else if (frame.ratio_dsd_drop < min_ratio_dsd_drop) {
        min_ratio_dsd_drop = frame.ratio_dsd_drop;
      }

      sum_ratio_dsd_saddle_height += frame.ratio_dsd_saddle_height;
      if (frame.ratio_dsd_saddle_height > max_ratio_dsd_saddle_height) {
        max_ratio_dsd_saddle_height = frame.ratio_dsd_saddle_height;
      } else if (frame.ratio_dsd_saddle_height < min_ratio_dsd_saddle_height) {
        min_ratio_dsd_saddle_height = frame.ratio_dsd_saddle_height;
      }
    }

    const len = this.frameList.length;
    for (const frame of this.frameList) {
      frame.ratio_stack_reach_moy = sum_ratio_stack_reach / len;
      frame.ratio_stack_reach_normal =
        (10.0 * (frame.ratio_stack_reach - min_ratio_stack_reach)) /
        (max_ratio_stack_reach - min_ratio_stack_reach);

      frame.ratio_dsd_drop_moy = sum_ratio_dsd_drop / len;
      frame.ratio_dsd_drop_normal =
        (10.0 * (frame.ratio_dsd_drop - min_ratio_dsd_drop)) /
        (max_ratio_dsd_drop - min_ratio_dsd_drop);

      frame.ratio_dsd_saddle_height_moy = sum_ratio_dsd_saddle_height / len;
      frame.ratio_dsd_saddle_height_normal =
        (10.0 * (frame.ratio_dsd_saddle_height - min_ratio_dsd_saddle_height)) /
        (max_ratio_dsd_saddle_height - min_ratio_dsd_saddle_height);
    }
  };

  /**
   * returns a list of frames sorted according to computed distance between frames
   * @param frame
   * @param saddleHeight
   * @param saddleForeAft
   * @param dsd
   * @param drop
   * @param ratio_dsd_drop
   * @param fork_rate
   * @returns {Array}
   */
  getSortedFrames(
    frame,
    dsd = '',
    drop = '-',
    ratio_dsd_drop = '',
    fork_rate = undefined,
    n = 10
  ) {
    const l = [];
    for (const f of this.frameList) {
      l.push({
        frame: f,
        distance: frame.distance(f, dsd, drop, ratio_dsd_drop, fork_rate),
      });
    }

    l.sort(function(pair1, pair2) {
      return pair1.distance - pair2.distance;
    });
    return l.slice(0, n);
  }
}

export default FrameDB;
