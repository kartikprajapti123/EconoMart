import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

def create_points(number):
    """Create random x and y positions for the dots."""
    return pd.DataFrame(
        np.random.random_sample(size=(number, 2)),
        columns=list("xy")
    )

def play_game():
    score = 0
    rounds = 5

    for round_number in range(1, rounds + 1):
        # Compare similar quantities: 10 vs 20 or 110 vs 120.
        baseline = int(np.random.choice([10, 110]))
        counts = [baseline, baseline + 10]
        np.random.shuffle(counts)

        fig, axes = plt.subplots(1, 2, figsize=(7, 3))

        for i, ax in enumerate(axes):
            points = create_points(counts[i])
            points.plot.scatter(
                x="x", y="y", ax=ax,
                color="black", s=12
            )
            ax.set_title("Square " + ("A" if i == 0 else "B"))
            ax.set_xlim(0, 1)
            ax.set_ylim(0, 1)
            ax.set_aspect("equal")
            ax.set_xticks([])
            ax.set_yticks([])
            ax.set_xlabel("")
            ax.set_ylabel("")

        plt.suptitle(
            f"Round {round_number}: Which square has more dots?"
        )
        plt.tight_layout()
        plt.show()

        answer = input("Which square has more dots? (A/B): ").strip().upper()
        correct_answer = "A" if counts[0] > counts[1] else "B"

        if answer == correct_answer:
            print("Correct! Well done.")
            score += 1
        else:
            print(f"Not quite. The correct answer was {correct_answer}.")

    print(f"Game finished! Your score: {score}/{rounds}")

if __name__ == "__main__":
    play_game()
