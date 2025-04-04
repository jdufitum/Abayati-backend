class Assignment:
    def __init__(self, name, category, weight, grade):
        self.name = name
        self.category = category
        self.weight = weight
        self.grade = grade

    def weighted_score(self):
        return (self.grade * self.weight) / 100


def validate_percentage(value, prompt):
    while True:
        try:
            val = float(input(prompt))
            if 0 <= val <= 100:
                return val
            else:
                print("Please enter a value between 0 and 100.")
        except ValueError:
            print("Invalid input! Please enter a numeric value.")


def collect_assignments():
    assignments = []
    while True:
        name = input("Enter assignment name (or type 'done' to finish): ")
        if name.lower() == 'done':
            break
        
        category = input("Enter category (Formative/Summative): ").strip().capitalize()
        while category not in ["Formative", "Summative"]:
            print("Invalid category. Please enter 'Formative' or 'Summative'.")
            category = input("Enter category (Formative/Summative): ").strip().capitalize()
        
        weight = validate_percentage(0, "Enter weight of the assignment (percentage): ")
        grade = validate_percentage(0, "Enter grade obtained (out of 100): ")
        
        assignments.append(Assignment(name, category, weight, grade))
    
    return assignments


def calculate_grades(assignments):
    total_weighted = 0
    total_weights = 0
    category_totals = {"Formative": 0, "Summative": 0}
    
    for assignment in assignments:
        weighted_score = assignment.weighted_score()
        total_weighted += weighted_score
        total_weights += assignment.weight
        category_totals[assignment.category] += weighted_score
    
    overall_grade = total_weighted / total_weights * 100 if total_weights > 0 else 0
    gpa = (overall_grade / 100) * 5  # Convert to a GPA scale of 5
    return overall_grade, gpa, category_totals


def determine_pass_fail(category_totals):
    formative_avg = category_totals["Formative"]
    summative_avg = category_totals["Summative"]
    
    if formative_avg >= 50 and summative_avg >= 50:
        return "Pass"
    return "Fail and Repeat"


def main():
    print("Welcome to the Assignment Grade Calculator!")
    assignments = collect_assignments()
    
    if not assignments:
        print("No assignments entered. Exiting program.")
        return
    
    overall_grade, gpa, category_totals = calculate_grades(assignments)
    result = determine_pass_fail(category_totals)
    
    print("\nGrade Summary:")
    print(f"Total Formative Grade: {category_totals['Formative']:.2f}%")
    print(f"Total Summative Grade: {category_totals['Summative']:.2f}%")
    print(f"Overall Grade: {overall_grade:.2f}%")
    print(f"GPA: {gpa:.2f}/5")
    print(f"Final Decision: {result}")
    

if __name__ == "__main__":
    main()