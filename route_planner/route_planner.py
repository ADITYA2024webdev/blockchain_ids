import math

def calculate_distance(p1, p2):
    """
    Calculates the Euclidean distance between two points (x1, y1) and (x2, y2).
    """
    return math.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)

def plan_route(locations, priorities):
    """
    Calculates the most efficient route based on priority and original order.
    """
    # 1. Create a map to assign numerical values to priorities for sorting.
    # Lower numbers will be sorted first.
    priority_map = {
        'high': 0,
        'medium': 1,
        'low': 2
    }
    
    # 2. Combine locations, priorities, and their original index into a single list.
    # We store the original index to ensure stability (Rule #3).
    delivery_points = []
    for i in range(len(locations)):
        delivery_points.append({
            'location': locations[i],
            'priority_level': priority_map.get(priorities[i], 3), # Default to low priority
            'original_index': i
        })

    # 3. Sort the list.
    # Python's sort is STABLE. This means when two items have the
    # same 'priority_level', their original relative order is preserved.
    # This automatically fulfills Rule #1 and Rule #3.
    delivery_points.sort(key=lambda point: point['priority_level'])
    
    # 4. Calculate the total distance of the sorted route.
    total_distance = 0
    optimized_route = []
    
    if not delivery_points:
        return [], 0

    # Start from the first point in our sorted list
    optimized_route.append(delivery_points[0]['location'])
    
    # Iterate from the first point to the second-to-last point
    for i in range(len(delivery_points) - 1):
        p1 = delivery_points[i]['location']
        p2 = delivery_points[i+1]['location']
        
        # Add the distance between the current point and the next one
        total_distance += calculate_distance(p1, p2)
        
        # Add the next point to our final route list
        optimized_route.append(p2)
        
    return optimized_route, total_distance

def get_user_input():
    """
    (Bonus Challenge 2)
    Allows the user to dynamically input locations and priorities.
    """
    locations = []
    priorities = []
    print("\n--- Enter Your Delivery Points ---")
    print("Enter 'done' when you are finished.")
    
    while True:
        try:
            loc_input = input(f"Enter location {len(locations)} (e.g., '2, 3') or 'done': ")
            if loc_input.lower() == 'done':
                break
            
            x_str, y_str = loc_input.split(',')
            x = int(x_str.strip())
            y = int(y_str.strip())
            locations.append((x, y))
            
            while True:
                priority = input(f"  Enter priority for ({x}, {y}) (high/medium/low): ").lower()
                if priority in ['high', 'medium', 'low']:
                    priorities.append(priority)
                    break
                else:
                    print("  Invalid priority. Please enter 'high', 'medium', or 'low'.")
                    
        except ValueError:
            print("Invalid input. Please enter coordinates as 'x, y'.")
        except Exception as e:
            print(f"An error occurred: {e}")

    return locations, priorities

def main():
    print("--- Smart Delivery Route Planner ---")
    
    while True:
        choice = input("Use (e)xample data or (i)nput your own? (e/i): ").lower()
        if choice == 'e':
            # Example data from the problem statement
            locations = [(0, 0), (2, 3), (5, 1), (6, 4), (1, 2)]
            priorities = ['high', 'medium', 'high', 'low', 'medium']
            break
        elif choice == 'i':
            # Bonus Challenge 2: Dynamic input
            locations, priorities = get_user_input()
            if not locations:
                print("No locations entered. Exiting.")
                return
            break
        else:
            print("Invalid choice. Please enter 'e' or 'i'.")

    # --- Process the Route ---
    
    print("\nCalculating route...")
    print(f"Input Locations: {locations}")
    print(f"Input Priorities: {priorities}")
    
    optimized_route, total_distance = plan_route(locations, priorities)
    
    # --- Display the Results ---
    print("\n--- Results ---")
    print(f"Optimized Route: {optimized_route}")
    print(f"Total Distance: {total_distance:.2f} units")


# --- Explanation for Bonus Challenge 1 (Traveling Salesman Problem) ---
#
# The solution above solves the main problem by sorting by priority
# while maintaining the original order (a "stable sort").
#
# The Bonus Challenge (TSP) is much more complex. It asks you to find
# the *absolute shortest path* within each priority group, ignoring
# the original input order (Rule #3).
#
# A simple way to *approximate* this is with a "Nearest Neighbor" algorithm:
# 1.  Group all 'high' priority points.
# 2.  Start at the first 'high' point.
# 3.  Find the *closest* unvisited 'high' point and travel to it.
# 4.  Repeat until all 'high' points are visited.
# 5.  From your *last* 'high' point, find the *closest* 'medium' point.
# 6.  Repeat the "nearest neighbor" process for all 'medium' points.
# 7.  Repeat again for all 'low' points.
#
# A true TSP solution (like dynamic programming) is very advanced,
# but the "Nearest Neighbor" approach is a great next step!

if __name__ == "__main__":
    main()