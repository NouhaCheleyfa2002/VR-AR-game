
export const feedbackData = [
    {
      feedbackId: 1,
    playerId: 1001,
    playerName: 'PlayerOne',
    rating: 4.5,
    comment: 'Great puzzle design and historical accuracy!',
    date: '2025-07-06T14:45:00Z',
  },
  {
    feedbackId: 2,
    playerId: 1002,
    playerName: 'Zara',
    rating: 3,
    comment: 'Interesting but a bit too hard.',
    date: '2025-07-05T10:20:00Z',
  },
  ];


  export const mockHints = [
    {
      hintId: "h1",
      puzzleId: "puzzle1",
      content: "Try checking the painting in the hallway.",
      hintLevel: 1,
      pointDeducted: 5,
      isUsed: true
    },
    {
      hintId: "h2",
      puzzleId: "puzzle1",
      content: "The symbols match the calendar order.",
      hintLevel: 2,
      pointDeducted: 10,
      isUsed: false  
    },
    {
      hintId: "h3",
      puzzleId: "puzzle2",
      content: "The symbols match the calendar order.",
      hintLevel: 3,
      pointDeducted: 6,
      isUsed: false  
    },
    {
      hintId: "h4",
      puzzleId: "puzzle4",
      content: "The symbols match the calendar order.",
      hintLevel: 4,
      pointDeducted: 8,
      isUsed: false  
    }
  ];
  

export const mockSessions = [
    {
      sessionId: 's1',
      playerId: 'p1',
      roomId: 'r1',
      gameId: 'g1',
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      totalScore: 85,
      hintsUsed: 1,
      completionRate: '90%',
      errorRate: '5%',
      avgSolveTime: '12.5',
      preferredDifficulty: 'Medium',
      hints: mockHints,
    },
    {
      sessionId: 's2',
      playerId: 'p2',
      roomId: 'r2',
      gameId: 'g2',
      startTime: new Date().toISOString(),
      endTime: null,
      totalScore: 100,
      hintsUsed: 0,
      completionRate: 'N/A',
      errorRate: 'N/A',
      avgSolveTime: '0',
      preferredDifficulty: 'Hard',
      hints: mockHints,
    },
  ];

export const defaultGames = [
  {
    id: 1,
    title: 'Pharaoh’s Tomb',
    description: 'Uncover ancient secrets before time runs out.',
    theme: 'Ancient',
    difficulty: 'Easy',
    maxPlayers: 5,
    estimatedDuration: 60,
    isActive: true,
    culturalContext: 'Medina of Mahdia',
  },
  {
    id: 2,
    title: 'Space Lockdown',
    description: 'Escape a doomed space station before it implodes.',
    theme: 'Sci-Fi',
    difficulty: 'Medium',
    maxPlayers: 4,
    estimatedDuration: 45,
    isActive: false,
    culturalContext: 'Futuristic Tunisia',
  },
];