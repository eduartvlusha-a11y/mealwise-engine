class HomeState {
  final bool isLoading;
  final Map<String, dynamic>? data;
  final String? error;

  HomeState({this.isLoading = false, this.data, this.error});

  HomeState copyWith({
    bool? isLoading,
    Map<String, dynamic>? data,
    String? error,
  }) {
    return HomeState(
      isLoading: isLoading ?? this.isLoading,
      data: data ?? this.data,
      error: error ?? this.error,
    );
  }
}
