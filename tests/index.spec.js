import assert from 'assert';
import oq from '../src/index';

describe('oq.format()', () => {
    [
        [
            'a',
            'a'
        ],
        [
            ['a'],
            'a'
        ],
        [
            [[0, 2]],
            '[0,2]'
        ],
        [
            [{start: 0, end: 2}],
            '[0:2]'
        ],
        [
            [1],
            '[1]'
        ],
        [
            [1, 2],
            '[1][2]'
        ],
        [
            [{push: true}],
            '[]'
        ],
        [
            ['a', 'b', {start: 0, end: 2}, 1, 2, [1, 2, 3]],
            'a.b[0:2][1][2][1,2,3]'
        ]
    ].forEach((test) => {
            let [query, expected] = test;

            it(`returns "${expected}" for query ${JSON.stringify(query)}`, () => {
                assert.strictEqual(oq.format(query), expected);
            });
        });
});

describe('oq.parse()', () => {
    [
        [
            ['a'],
            ['a']
        ],
        [
            'a',
            ['a']
        ],
        [
            '[0,2]',
            [[0, 2]]
        ],
        [
            '[0:2]',
            [{start: 0, end: 2}]
        ],
        [
            '[1]',
            [1]
        ],
        [
            '[1][2]',
            [1, 2]
        ],
        [
            '[]',
            [{push: true}]
        ],
        [
            'a.b[0:2][1][2][1,2,3]',
            ['a', 'b', {start: 0, end: 2}, 1, 2, [1, 2, 3]]
        ]
    ].forEach((test) => {
            let [query, expected] = test;

            it(`returns ${JSON.stringify(expected)} for query "${query}"`, () => {
                assert.deepEqual(oq.parse(query), expected);
            });
        });
});

describe('oq.get()', () => {
    const ARRAY_OF_SCALARS = [1, 2, 3, 4, 5, 6];
    const ARRAY_OF_OBJECTS = [
        {a: 1, b: {c: 1}, d: [null, {e: 1, f: [{g: 1, h: [1, 2, 3, 4]}]}]},
        {a: 2, b: {c: 2}, d: [null, {e: 2, f: [{g: 2, h: [2, 3, 4, 5]}]}]},
        {a: 3, b: {c: 3}, d: [null, {e: 3, f: [{g: 3, h: [3, 4, 5, 6]}]}]}
    ];
    const OBJECT = {
        a: 1,
        b: {
            c: 1
        }
    };

    it('returns a function', () => {
        let o = oq.get('test');
        assert.strictEqual(typeof o, 'function');
    });

    describe('run query', () => {
        [
            [
                ARRAY_OF_SCALARS,
                '[0, 1, 2]',
                [
                    1, 2, 3
                ]
            ],
            [
                ARRAY_OF_SCALARS,
                [[0, 1, 2]],
                [
                    1, 2, 3
                ]
            ],
            [
                ARRAY_OF_SCALARS,
                '[*]',
                [
                    1, 2, 3, 4, 5, 6
                ]
            ],
            [
                ARRAY_OF_SCALARS,
                [true],
                [
                    1, 2, 3, 4, 5, 6
                ]
            ],
            [
                ARRAY_OF_SCALARS,
                '[0:3]',
                [
                    1, 2, 3
                ]
            ],
            [
                ARRAY_OF_SCALARS,
                [{start: 0, end: 3}],
                [
                    1, 2, 3
                ]
            ],
            [
                ARRAY_OF_OBJECTS,
                '[*].a',
                [1, 2, 3]
            ],
            [
                ARRAY_OF_OBJECTS,
                [true, 'a'],
                [1, 2, 3]
            ],
            [
                ARRAY_OF_OBJECTS,
                '[*].aa',
                [undefined, undefined, undefined]
            ],
            [
                ARRAY_OF_OBJECTS,
                [true, 'aa'],
                [undefined, undefined, undefined]
            ],
            [
                ARRAY_OF_OBJECTS,
                '[*].b.c',
                [
                    1, 2, 3
                ]
            ],
            [
                ARRAY_OF_OBJECTS,
                [true, 'b', 'c'],
                [
                    1, 2, 3
                ]
            ],
            [
                ARRAY_OF_OBJECTS,
                '[*].d[1].f[0].h',
                [
                    [1, 2, 3, 4],
                    [2, 3, 4, 5],
                    [3, 4, 5, 6]
                ]
            ],
            [
                ARRAY_OF_OBJECTS,
                [true, 'd', 1, 'f', 0, 'h'],
                [
                    [1, 2, 3, 4],
                    [2, 3, 4, 5],
                    [3, 4, 5, 6]
                ]
            ],
            [
                ARRAY_OF_OBJECTS,
                '[*].d[1].f[0].h[0]',
                [
                    1, 2, 3
                ]
            ],
            [
                ARRAY_OF_OBJECTS,
                [true, 'd', 1, 'f', 0, 'h', 0],
                [
                    1, 2, 3
                ]
            ],
            [
                ARRAY_OF_OBJECTS,
                '[*].d[1].f[0].h[*]',
                [
                    [1, 2, 3, 4],
                    [2, 3, 4, 5],
                    [3, 4, 5, 6]
                ]
            ],
            [
                ARRAY_OF_OBJECTS,
                [true, 'd', 1, 'f', 0, 'h', true],
                [
                    [1, 2, 3, 4],
                    [2, 3, 4, 5],
                    [3, 4, 5, 6]
                ]
            ],
            [
                ARRAY_OF_OBJECTS,
                '[*].d[1].f[0].h[0, 2]',
                [
                    [1, 3],
                    [2, 4],
                    [3, 5]
                ]
            ],
            [
                ARRAY_OF_OBJECTS,
                [true, 'd', 1, 'f', 0, 'h', [0, 2]],
                [
                    [1, 3],
                    [2, 4],
                    [3, 5]
                ]
            ],
            [
                ARRAY_OF_OBJECTS,
                '[*].d[1].f[0].h[0:3]',
                [
                    [1, 2, 3],
                    [2, 3, 4],
                    [3, 4, 5]
                ]
            ],
            [
                ARRAY_OF_OBJECTS,
                [true, 'd', 1, 'f', 0, 'h', {start: 0, end: 3}],
                [
                    [1, 2, 3],
                    [2, 3, 4],
                    [3, 4, 5]
                ]
            ],
            [
                OBJECT,
                'a',
                1
            ],
            [
                OBJECT,
                ['a'],
                1
            ],
            [
                OBJECT,
                'b.c',
                1
            ],
            [
                OBJECT,
                ['b', 'c'],
                1
            ]
        ].forEach((test) => {
                let [data, query, expected] = test;

                it(`returns correct result for ${(typeof query == 'string' ? '"' + query + '"': JSON.stringify(query))}`, () => {
                    let getter = oq.get(query);

                    assert.deepEqual(getter(data), expected);
                });
            });
    });
});

const SETTER_TEST_CASE = [
    [
        'a',
        1,
        {test: 'test', arr: [1], a: 1}
    ],
    [
        'a.b',
        1,
        {test: 'test', arr: [1], a: {b: 1}}
    ],
    [
        'a.b.c',
        1,
        {test: 'test', arr: [1], a: {b: {c: 1}}}
    ],
    [
        'a.b.c.d',
        1,
        {test: 'test', arr: [1], a: {b: {c: {d: 1}}}}
    ],
    [
        'a.b[1]',
        1,
        {test: 'test', arr: [1], a: {b: [, 1]}}
    ],
    [
        'arr[*]',
        2,
        {test: 'test', arr: [2]}
    ],
    [
        'arr[1,2,3]',
        2,
        {test: 'test', arr: [1, 2, 2, 2]}
    ],
    [
        'arr[0:1]',
        3,
        {test: 'test', arr: [3]}
    ],
    [
        'arr[]',
        2,
        {test: 'test', arr: [1, 2]}
    ],
    [
        'arr[].b.c.d',
        2,
        {test: 'test', arr: [1, {b: {c: {d: 2}}}]}
    ]
];

describe('oq.set()', () => {
    const OBJECT = {test: 'test', arr: [1]};

    SETTER_TEST_CASE.forEach((test) => {
            let [query, value, expected] = test;

            it(`sets correct value with query ${(typeof query == 'string' ? '"' + query + '"': JSON.stringify(query))}`, () => {
                let setter = oq.set(query);

                assert.deepEqual(setter(OBJECT, value), expected);
            });
        });

    SETTER_TEST_CASE.forEach((test) => {
        let [query, value, expected] = test;

        it(`sets correct value with query ${(typeof query == 'string' ? '"' + query + '"': JSON.stringify(query))} and bound value`, () => {
            let setter = oq.set(query, value);

            assert.deepEqual(setter(OBJECT), expected);
        });
    });

    it('sets result of function provided as value', () => {
        let setter = oq.set('arr[0]');

        assert.deepEqual(setter({arr: [1]}, (i) => i + 2), {arr: [3]});
    });
});

describe('oq.patch()', () => {
    let OBJECT;

    beforeEach(() => {
        OBJECT = {test: 'test', arr: [1]};
    });

    SETTER_TEST_CASE.forEach((test) => {
            let [query, value, expected] = test;

            it(`patches object with value with query ${(typeof query == 'string' ? '"' + query + '"': JSON.stringify(query))}`, () => {
                let patcher = oq.patch(query);
                patcher(OBJECT, value);

                assert.deepEqual(OBJECT, expected);
            });
        });
});
