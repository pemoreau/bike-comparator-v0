import React, { Component } from 'react';
import DownshiftBike from './DownshiftBike';
import Bike from './Bike';
import FrameDB from './FrameDB';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      frameDB: new FrameDB(),
      isLoading: false,
      error: null,

      selectedBrand: null,
      selectedModel: null,
      selectedSize: null,
      selectedYear: null,
      selectedBike: null,
    };

    this.componentDidMount = this.componentDidMount.bind(this);
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    this.state.frameDB.populate();
    this.setState({ isLoading: false });
  }

  render() {
    const {
      frameDB,
      selectedBrand,
      selectedModel,
      selectedSize,
      selectedYear,
      selectedBike,
      sortedFrames,
    } = this.state;
    return (
      <div className="container">
        <header>
          <h1>Welcome to Bike Comparator!</h1>
        </header>
        <h3>This web site will help you to find a bike similar to yours!</h3>

        <h3>Select your bike</h3>
        <DownshiftBike
          field="brand"
          getItems={() => frameDB.getBrands()}
          getSelected={() => selectedBrand}
          setSelected={item =>
            this.setState({
              selectedBrand: item,
              selectedModel: undefined,
              selectedSize: undefined,
              selectedYear: undefined,
            })
          }
        />
        <DownshiftBike
          field="model"
          getItems={() =>
            selectedBrand ? frameDB.getModels(selectedBrand) : []
          }
          getSelected={() => selectedModel}
          setSelected={item =>
            this.setState({
              selectedModel: item,
              selectedSize: undefined,
              selectedYear: undefined,
            })
          }
        />
        <DownshiftBike
          field="size"
          getItems={() =>
            selectedBrand && selectedModel
              ? frameDB.getSizes(selectedBrand, selectedModel)
              : []
          }
          setSelected={item =>
            this.setState({
              selectedSize: item,
              selectedYear: undefined,
            })
          }
          getSelected={() => selectedSize}
        />
        <DownshiftBike
          field="year"
          getItems={() =>
            selectedBrand && selectedModel && selectedSize
              ? frameDB.getYears(selectedBrand, selectedModel, selectedSize)
              : []
          }
          setSelected={item => this.setState({ selectedYear: item })}
          getSelected={() => selectedYear}
        />

        <br />
        <button
          disabled={
            !(selectedBrand && selectedModel && selectedSize && selectedYear)
          }
          onClick={() => {
            const bike = frameDB.getFrame(
              selectedBrand,
              selectedModel,
              selectedSize,
              selectedYear
            );

            // bestBike is a list of {frame,distance}
            const bestBikes = frameDB.getSortedFrames(bike, 10);
            // normalize distance

            const distances = bestBikes.map(p => p.distance);
            console.log(`distances: ${distances}`);

            const maxDistance = Math.max(...bestBikes.map(p => p.distance));
            console.log(`max = ${maxDistance}`);

            for (const p of bestBikes) {
              p.distance /= maxDistance === 0 ? 1 : maxDistance;
            }

            console.log(bestBikes);

            //     maxDistance = maxDistance === 0 ? 1 : maxDistance;

            // }

            console.log(bestBikes);
            this.setState({
              selectedBike: bike,
              sortedFrames: bestBikes,
            });
          }}
        >
          Run Comparator
        </button>

        <h3>Selected bike</h3>
        <ul>
          {selectedBike ? (
            <Bike key={selectedBike._id} bike={selectedBike} />
          ) : (
            <li>No selected bike</li>
          )}
        </ul>

        <h3>Top bikes</h3>
        <ul>
          {sortedFrames ? (
            sortedFrames.map(pair => (
              <Bike
                key={pair.frame._id}
                bike={pair.frame}
                distance={pair.distance}
              />
            ))
          ) : (
            <li>Select a bike first</li>
          )}
        </ul>
      </div>
    );
  }
}

export default App;
