# AI Recommendation System

## Overview

The UTA Market AI recommendation system is designed to provide personalized product recommendations based on user behavior and preferences. The system learns and improves over time as users interact with the platform.

## Data Collection

The system tracks four types of user interactions:

1. **Views** - When a user views a product
2. **Wishlist** - When a user adds a product to their wishlist
3. **Add to Cart** - When a user adds a product to their cart
4. **Purchases** - When a user completes a purchase

These interactions are stored in the `ai_recommendation_logs` table with timestamps, allowing the system to track both the type and recency of interactions.

## Recommendation Algorithm

### 1. User Behavior Analysis

The system analyzes user behavior through several metrics:

- Total number of interactions
- Number of unique products interacted with
- Breakdown of interaction types
- Time since last interaction
- Category preferences
- Purchase history

### 2. Scoring System

The recommendation algorithm uses a sophisticated scoring system with multiple components:

#### Interaction Weights

- Purchase: 4 points
- Add to Cart: 3 points
- Wishlist: 2 points
- View: 1 point

#### Similarity Scoring (40% total weight)

- Category Preference: 40%
  - Base weight: 0.4
  - Additional boost based on category purchase history
- Color Match: 25%
- Size Match: 15%
- Recent Interaction Boost: 10%
- Purchase History Boost: 10%

#### User Engagement Levels

The system adapts to user engagement levels:

- Experienced Users (>50 interactions): 1.0 weight
- Intermediate Users (>20 interactions): 0.8 weight
- New Users (>5 interactions): 0.6 weight
- Very New Users (≤5 interactions): 0.4 weight

### 3. Dynamic Weighting Formula

The final recommendation score is calculated using:

```
Final Score = (Interaction Weight * 0.6 + Similarity Score * 0.4) * (0.7 + (User Engagement Score * 0.3))
```

## Learning and Improvement

### 1. Short-term Learning

- Tracks recent interactions (last 30 days)
- Gives higher weight to recent activities
- Adapts to changing user interests

### 2. Long-term Learning

- Builds user profiles based on historical data
- Identifies category preferences
- Learns from successful recommendations (purchases)

### 3. Category Analysis

- Tracks user preferences across different categories
- Identifies most frequently purchased categories
- Considers wishlist patterns
- Analyzes interaction frequency per category

## Implementation Details

### Database Structure

The system uses several tables:

- `ai_recommendation_logs`: Stores user interactions
- `products`: Product information
- `categories`: Category information
- `users`: User information

### Query Optimization

The recommendation query is optimized for:

- Performance with large datasets
- Real-time recommendations
- Scalability
- Memory efficiency

## Benefits

1. **Personalization**

   - Tailored recommendations based on individual preferences
   - Adapts to changing user interests
   - Considers multiple factors in decision making

2. **User Experience**

   - Improves over time with more interactions
   - Provides relevant suggestions
   - Helps users discover new products

3. **Business Value**
   - Increases user engagement
   - Boosts conversion rates
   - Enhances customer satisfaction

## Future Improvements

1. **Enhanced Learning**

   - Implement machine learning models
   - Add seasonal trend analysis
   - Consider price sensitivity

2. **User Feedback**

   - Add explicit feedback mechanisms
   - Implement A/B testing
   - Track recommendation effectiveness

3. **Performance Optimization**
   - Implement caching strategies
   - Add batch processing for heavy computations
   - Optimize database queries further

## Usage Guidelines

1. **For New Users**

   - System starts with general recommendations
   - Gradually learns preferences
   - Focuses on popular items initially

2. **For Experienced Users**

   - Provides highly personalized recommendations
   - Considers long-term preferences
   - Adapts to changing interests

3. **For Administrators**
   - Monitor recommendation effectiveness
   - Adjust weights as needed
   - Track user engagement metrics
