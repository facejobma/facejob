fn get_maximum_gross_value(arr: &[i32]) -> i32 {
  let n = arr.len();

  let mut prefix = vec![0; n + 1];
  for i in 1..=n {
      prefix[i] = prefix[i - 1] + arr[i - 1];
  }

  let mut max_gross_value = i32::MIN;

  for i1 in 1..=n {
      for i2 in (i1 + 1)..=n {
          for i3 in i2..=n {
              let sum_1_i1 = prefix[i1 - 1];
              let sum_i1_i2 = prefix[i2 - 1] - prefix[i1 - 1];
              let sum_i2_i3 = prefix[i3] - prefix[i2 - 1];
              let sum_i3_n = prefix[n] - prefix[i3];
              let gross_value = sum_1_i1 - sum_i1_i2 + sum_i2_i3 - sum_i3_n;
              if gross_value > max_gross_value {
                  max_gross_value = gross_value;
              }
          }
      }
  }

  max_gross_value
}