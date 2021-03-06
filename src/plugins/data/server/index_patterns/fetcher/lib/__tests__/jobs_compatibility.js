/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import expect from '@kbn/expect';
import { areJobsCompatible, mergeJobConfigurations } from '../jobs_compatibility';
import { jobs } from './fixtures';

describe('areJobsCompatible', () => {
  it('should return false for invalid jobs arg', () => {
    expect(areJobsCompatible(123)).to.eql(false);
    expect(areJobsCompatible('foo')).to.eql(false);
  });

  it('should return true for no jobs or one job', () => {
    expect(areJobsCompatible()).to.eql(true);
    expect(areJobsCompatible([])).to.eql(true);
    expect(areJobsCompatible([jobs[1]])).to.eql(true);
  });

  it('should return true for 2 or more compatible jobs', () => {
    expect(areJobsCompatible([jobs[0], jobs[1]])).to.eql(true);
    expect(areJobsCompatible([jobs[1], jobs[0], jobs[1]])).to.eql(true);
  });

  it('should return false for 2 or more incompatible jobs', () => {
    expect(areJobsCompatible([jobs[1], jobs[2]])).to.eql(false);
    expect(areJobsCompatible([jobs[2], jobs[1], jobs[0]])).to.eql(false);
  });
});

describe('mergeJobConfigurations', () => {
  it('should throw an error for null/invalid jobs', () => {
    expect(mergeJobConfigurations).withArgs().to.throwException();
    expect(mergeJobConfigurations).withArgs(null).to.throwException();
    expect(mergeJobConfigurations).withArgs(undefined).to.throwException();
    expect(mergeJobConfigurations).withArgs(true).to.throwException();
    expect(mergeJobConfigurations).withArgs('foo').to.throwException();
    expect(mergeJobConfigurations).withArgs(123).to.throwException();
    expect(mergeJobConfigurations).withArgs([]).to.throwException();
  });

  it('should return aggregations for one job', () => {
    expect(mergeJobConfigurations([jobs[0]])).to.eql({
      aggs: {
        terms: {
          node: {
            agg: 'terms',
          },
        },
        min: {
          temperature: {
            agg: 'min',
          },
        },
        max: {
          temperature: {
            agg: 'max',
          },
        },
        sum: {
          temperature: {
            agg: 'sum',
          },
          voltage: {
            agg: 'sum',
          },
        },
        date_histogram: {
          timestamp: {
            agg: 'date_histogram',
            time_zone: 'UTC',
            interval: '1h',
            delay: '7d',
          },
        },
        histogram: {
          voltage: {
            agg: 'histogram',
            interval: 5,
          },
        },
      },
    });
  });

  it('should return merged aggregations for 2 jobs', () => {
    expect(mergeJobConfigurations([jobs[0], jobs[1]])).to.eql({
      aggs: {
        terms: {
          node: {
            agg: 'terms',
          },
          host: {
            agg: 'terms',
          },
        },
        min: {
          temperature: {
            agg: 'min',
          },
        },
        max: {
          temperature: {
            agg: 'max',
          },
        },
        sum: {
          temperature: {
            agg: 'sum',
          },
          voltage: {
            agg: 'sum',
          },
        },
        date_histogram: {
          timestamp: {
            agg: 'date_histogram',
            time_zone: 'UTC',
            interval: '1h',
            delay: '7d',
          },
        },
        histogram: {
          voltage: {
            agg: 'histogram',
            interval: 20,
          },
        },
      },
    });
  });

  it('should throw an error if jobs are not compatible', () => {
    expect(mergeJobConfigurations).withArgs([jobs[0], jobs[1], jobs[2]]).to.throwException();
  });
});
