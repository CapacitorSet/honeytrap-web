import React, { Component } from 'react';

import { connect } from 'react-redux';

import moment from 'moment';

import * as d3 from 'd3';
import * as topojson from 'topojson';

import Color from 'color';

import { fetchCountries } from '../actions/index';

class Earth extends Component {
    constructor() {
        super();

        this.hotCountries = [];

        this.state = {
            angle: 90,
            countries: [],
            loading: true,
        };
    }

    componentDidMount() {
        const { dispatch } = this.props;

        dispatch(fetchCountries()).then(() => {
            this.setState({loading: false});
        });

        const angle = 90;
        this.projection = d3.geoOrthographic()
            .clipAngle(angle);

        const drag = d3.drag()
            .on('drag', () => {
                const {dx, dy} = d3.event;

                const rotation = this.projection.rotate();
                const radius = this.projection.scale();

                const scale = d3.scaleLinear()
                    .domain([-1 * radius, radius])
                    .range([-90, 90]);

                const degX = scale(dx);
                const degY = scale(dy);

                rotation[0] += degX;
                rotation[1] -= degY;

                if (rotation[1] > 90)   rotation[1] = 90;
                if (rotation[1] < -90)  rotation[1] = -90;
                if (rotation[0] >= 180) rotation[0] -= 360;

                this.projection.rotate(rotation);

                this.updateCanvas();
            });

        const zoom = d3.zoom()
            .scaleExtent([200, 2000]);

        zoom
            .on('zoom', (event) => {
                this.projection.scale(d3.event.transform.k, d3.event.transform.k);
                this.updateCanvas();
            });

        d3.select(this.canvas).call(drag);
        d3.select(this.canvas).call(zoom);

        window.addEventListener("resize", () => this.updateDimensions());
    }

    componentWillUnmount() {
        window.removeEventListener("resize", () => this.updateDimensions());
    }

    componentDidUpdate(nextProps, nextState) {
        if (!nextProps.countries.length)
            return;

        const { countries } = nextProps.topology;
        if (!countries)
            return;

        this.updateCanvas();

        this.hotCountries = nextProps.countries.reduce((red, value) => {
            const country = countries.find(v => v.iso_a2 == value.isocode);

            if (!country)
                return red;

            return red.concat({
                ...value,
                ...country,
            });
        }, []);

        if (this.hotCountries.length == 0)
            return;

        // sort on time
        this.hotCountries.sort((left, right) => {
            return moment(left.last).utc().diff(moment(right.last).utc());
        });


        const last = this.hotCountries[this.hotCountries.length - 1]

        const p = d3.geoCentroid(last);

        const projection = this.projection;

        d3.transition()
            .duration(2500)
            .tween("rotate", () => {
                const r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
                return (t) => {
                    projection.rotate(r(t));

                    this.updateCanvas();
                };
            });

        return
    }

    updateDimensions() {
        let w = window,
            d = document,
            width = w.innerWidth || d.documentElement.clientWidth || d.body.clientWidth,
            height = w.innerHeight || d.documentElement.clientHeight || d.body.clientHeight;

        this.setState({width, height});
    }

    updateCanvas() {
        requestAnimationFrame(() => {
            const canvas = this.canvas;
            if (!canvas)
                return;

            const context = canvas.getContext('2d');

            const path = d3.geoPath().
                context(context).
                projection(
                    this.projection
                        .translate([canvas.width / 2, (canvas.height * (5 / 12))])
                );

            context.clearRect(0, 0, canvas.width, canvas.height);

            context.beginPath();
            path({type: 'Sphere'});
            context.fillStyle = '#1b202d';
            context.fill();

            const { world } = this.props.topology;
            if (!world)
                return;

            const land = topojson.feature(world, world.objects.land);
            context.beginPath();
            path(land);
            context.fillStyle = 'white';
            context.fill();

            context.strokeStyle = 'gray';
            context.stroke();

            const total = this.hotCountries.reduce((total, country) => total + country.count, 0);

            this.hotCountries.forEach((country) => {
                const min = 1 + moment().diff(country.last, 'minutes');
                context.beginPath();
                const color = color.lighten((Math.log(min) * 50) * (country.count / total));
                context.fillStyle = color.hexString();
                path(country);
                context.fill();
            });

            context.beginPath();
            context.fillStyle = 'white';
            path(topojson.mesh(world));
            context.stroke();

            /*
              var circle = d3.geo.circle().angle(5).origin([-0.8432, 51.4102]);
              circles = [];
              circles.push( circle() );
              circle.origin([-122.2744, 37.7561]);
              circles.push( circle() );
              context.fillStyle = "rgba(0,100,0,.5)";
              context.lineWidth = .2;
              context.strokeStyle = "#000";
              context.beginPath();
              path({type: "GeometryCollection", geometries: circles});
              context.fill();
              context.stroke();
            */

            /*
              context.lineWidth = 2;
              context.strokeStyle = "rgba(0,100,0,.7)";
              context.beginPath();
              path({type: "LineString", coordinates: [[-0.8432, 51.4102],[-122.2744, 37.7561]] });
              context.stroke();
            */
        });
    }

    render() {
        const { loading } = this.state;

        return (
            <div>
                <canvas className={ loading ? "hidden" : ""} style={{ 'cursor': 'move' }} ref={(ref) => this.canvas = ref} width={900} height={800}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        topology: state.sessions.topology,
    };
}

export default connect(mapStateToProps)(Earth);
