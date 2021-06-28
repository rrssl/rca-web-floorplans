import os

import numpy as np
import pandas as pd
from flask import Flask, json, jsonify, render_template, request

app = Flask(__name__)
data_dir = os.path.abspath("../data")
database_path = os.path.join(data_dir, "metadata.feather")
database = pd.read_feather(database_path)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/FloorPlanSearch")
def search_floorplans():
    n_results = 10
    masks = {}
    if request.args:
        for key in request.args:
            if key == 'type':
                value = request.args.get(key).upper()
                mask = database['TA Group'] == value
            if key in masks:
                masks[key] |= mask
            else:
                masks[key] = mask
        final_mask = np.logical_and.reduce(list(masks.values()))
        results = database[final_mask]
    else:
        results = database
    # For now, return a random subset.
    # TODO Once we implement pagination in the frontend, accept a page number
    # parameter and return the corresponding chunk of plans (no more random).
    results = results.sample(n_results)

    plans = []
    for _, result in results.iterrows():
        plan = {
            'metadata': [
                f"Type: {result['TA Group'].capitalize()}",
                f"Year built: {result['Year']}",
                f"Total area: {result['Total Unit Area']:.2f}m²"
            ]
        }
        path = os.path.join(data_dir, "plans", f"{result['Plan ID']}.geojson")
        with open(path) as f:
            plan['geo'] = json.load(f)
        plans.append(plan)

    return jsonify(plans)
